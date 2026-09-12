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
	v: TSVisrior,
	file: SourceFile,
) {
	let scopes: ScopeHelper[] = [];
	let currentScope = new ScopeHelper();
	const visitor = <T extends Node>(node: T): T => {
		if (isBlock(node)) {
			scopes.push(currentScope);
			currentScope = new ScopeHelper(currentScope);
		}

		const resNode = visitEachChild<T>(
			v(node as any, context.factory, currentScope) as T,
			visitor,
			context,
		);
		if (isImportDeclaration(resNode)) {
			if (resNode.importClause) {
				const {
					importClause: { name, namedBindings },
					moduleSpecifier,
				} = resNode;
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
						currentScope.scope[parseExpressionToValue(namedBindings.name)] = {
							type: ScopeVarType.Import,
							filePath: parseExpressionToValue(moduleSpecifier),
							varPath: [],
						};
					}
				}
			}
		}
		if (isVariableDeclaration(resNode)) {
			currentScope.applyVarBind(resNode.name, resNode.initializer, false);
		}
		if (isBlock(node)) {
			currentScope = scopes.pop()!;
		}
		return resNode;
	};

	return visitor(file);
}
export function createTransformerFactoryByTsVistor(
	v: TSVisrior,
): TransformerFactory<SourceFile> {
	return (context) => (file) => tsVisitorHandel(context, v, file);
}
export { ScopeVarType, TSVisrior } from "./type.js";
