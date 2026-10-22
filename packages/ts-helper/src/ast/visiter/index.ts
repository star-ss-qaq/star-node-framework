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
import { ScopeVarType, TSVisitor } from "./type.js";
import { ScopeHelper } from "./scope.js";

export function tsVisitorHandel(
	context: TransformationContext,
	visitor: TSVisitor | TSVisitor[],
	file: SourceFile,
) {
	if (!Array.isArray(visitor)) return tsVisitorHandel(context, [visitor], file);
	const enableScop = visitor.some((v) => v.enableScop);
	let scopes: ScopeHelper[] = [];
	let currentScope = new ScopeHelper();
	visitor.forEach((v) => {
		if (v.globalScop) {
			Object.entries(v.globalScop).forEach(([k, s]) => {
				currentScope.scope[k] = s;
			});
		}
	});
	const beforeVisitor = visitor.filter((i) => i.before);
	const afterVisitor = visitor.filter((i) => i.after);
	const innerVisitor = <T extends Node>(node: T): T[] => {
		let flagIsBlock = false;
		if (enableScop && isBlock(node)) {
			scopes.push(currentScope);
			currentScope = new ScopeHelper(currentScope);
			flagIsBlock = true;
		}
		const beforeNode = beforeVisitor.reduce(
			(nodes, visitor) =>
				nodes.flatMap((node) =>
					visitor.before!(node, context.factory, currentScope),
				),
			[node as any],
		);
		const resNode = beforeNode.flatMap((node) =>
			visitEachChild<T>(node, innerVisitor, context),
		);
		const afterNode = afterVisitor.reduce(
			(nodes, visitor) =>
				nodes.flatMap((node) =>
					visitor.after!(node, context.factory, currentScope),
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
export function createTransformerFactoryByTsVisitor(
	v: TSVisitor,
): TransformerFactory<SourceFile> {
	return (context) => (file) => tsVisitorHandel(context, v, file);
}

export { ScopeVarType, type ScopeVar, type TSVisitor } from "./type.js";
export { ScopeHelper } from "./scope.js";
