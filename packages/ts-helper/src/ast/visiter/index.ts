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
import { ScopeVarType, TSVisrior, TSVisriorConfig } from "./type.js";
import { ScopeHelper } from "./scope.js";

export function tsVisitorHandel(
	context: TransformationContext,
	visrior: TSVisrior,
	file: SourceFile,
) {
	const { globalScop = {}, enableScop = false } = visrior;
	let scopes: ScopeHelper[] = [];
	let currentScope = new ScopeHelper();
	Object.entries(globalScop).forEach(([k, s]) => {
		currentScope.scope[k] = s;
	});
	console.log(currentScope.scope);
	const innerVisitor = <T extends Node>(node: T): T => {
		let flagIsBlock = false;
		if (enableScop && isBlock(node)) {
			scopes.push(currentScope);
			currentScope = new ScopeHelper(currentScope);
			flagIsBlock = true;
		}

		const resNode = visitEachChild<T>(
			visrior(node as any, context.factory, currentScope) as T,
			innerVisitor,
			context,
		);
		if (enableScop && resNode) {
			(Array.isArray(resNode) ? resNode : [resNode]).forEach((node) => {
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
		return resNode;
	};

	return innerVisitor(file);
}
export function createTransformerFactoryByTsVistor(
	v: TSVisrior,
): TransformerFactory<SourceFile> {
	return (context) => (file) => tsVisitorHandel(context, v, file);
}
export function setTSVisriorConfig(
	v: TSVisrior,
	config: TSVisriorConfig,
): TSVisrior {
	return Object.assign(v, config);
}
export { ScopeVarType, TSVisrior, TSVisriorConfig } from "./type.js";
