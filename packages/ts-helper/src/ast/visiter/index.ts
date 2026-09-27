import {
	isBlock,
	isImportDeclaration,
	isNamedImports,
	isNamespaceImport,
	isVariableDeclaration,
	Node,
	SourceFile,
	TransformationContext,
	TransformerFactory,
	visitEachChild,
} from "typescript";
import { parseExpressionToValue } from "../parse-to-value.js";
import { ScopeVarType, TSVisrior } from "./type.js";
import { ScopeHelper } from "./scope.js";

export function tsVisitorHandel(
	context: TransformationContext,
	visrior: TSVisrior | TSVisrior[],
	file: SourceFile,
) {
	if (!Array.isArray(visrior)) return tsVisitorHandel(context, [visrior], file);
	const enableScop = visrior.some((v) => v.enableScop);
	let scopes: ScopeHelper[] = [];
	let currentScope = new ScopeHelper();
	visrior.forEach((v) => {
		if (v.globalScop) {
			Object.entries(v.globalScop).forEach(([k, s]) => {
				currentScope.scope[k] = s;
			});
		}
	});
	const beforeVisriors = visrior.filter((i) => i.before);
	const afterVisriors = visrior.filter((i) => i.after);
	const innerVisitor = <T extends Node>(node: T): T[] => {
		let flagIsBlock = false;
		if (enableScop && isBlock(node)) {
			scopes.push(currentScope);
			currentScope = new ScopeHelper(currentScope);
			flagIsBlock = true;
		}
		const beforeNode = beforeVisriors.reduce(
			(nodes, visrior) =>
				nodes.flatMap((node) =>
					visrior.before!(node, context.factory, currentScope),
				),
			[node as any],
		);
		const resNode = beforeNode.flatMap((node) =>
			visitEachChild<T>(node, innerVisitor, context),
		);
		const afterNode = afterVisriors.reduce(
			(nodes, visrior) =>
				nodes.flatMap((node) =>
					visrior.after!(node, context.factory, currentScope),
				),
			resNode.filter(Boolean) as any[],
		);
		if (enableScop && afterNode) {
			afterNode.forEach((node) => {
				if (isImportDeclaration(node)) {
					if (node.importClause) {
						const {
							importClause: { name, namedBindings },
							moduleSpecifier,
						} = node;
						if (name) {
							currentScope.scope[parseExpressionToValue(name)] = {
								type: ScopeVarType.Import,
								filePath: parseExpressionToValue(moduleSpecifier),
								varPath: ["default"],
							};
						}
						if (namedBindings) {
							if (isNamedImports(namedBindings)) {
								namedBindings.elements.forEach((b) => {
									const name = parseExpressionToValue(b.name);
									currentScope.scope[name] = {
										type: ScopeVarType.Import,
										filePath: parseExpressionToValue(moduleSpecifier),
										varPath: [
											b.propertyName
												? parseExpressionToValue(b.propertyName)
												: name,
										],
									};
								});
							} else if (isNamespaceImport(namedBindings)) {
								currentScope.scope[parseExpressionToValue(namedBindings.name)] =
									{
										type: ScopeVarType.Import,
										filePath: parseExpressionToValue(moduleSpecifier),
										varPath: [],
									};
							}
						}
					}
				} else if (isVariableDeclaration(node)) {
					currentScope.applyVarBind(node.name, node.initializer, false);
				}
			});
		}
		if (flagIsBlock) {
			currentScope = scopes.pop()!;
		}
		return afterNode;
	};

	return innerVisitor(file)[0];
}
export function createTransformerFactoryByTsVistor(
	v: TSVisrior,
): TransformerFactory<SourceFile> {
	return (context) => (file) => tsVisitorHandel(context, v, file);
}

export { ScopeVarType, type ScopeVar, type TSVisrior } from "./type.js";
export { ScopeHelper } from "./scope.js";
