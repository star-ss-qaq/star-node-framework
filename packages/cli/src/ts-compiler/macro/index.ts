import {
	Node,
	MethodDeclaration,
	isCallExpression,
	isIdentifier,
	isStringLiteral,
	SyntaxKind,
	ModifierLike,
	isTypeReferenceNode,
	isObjectLiteralExpression,
	isPropertyAssignment,
	SourceFile,
	isSourceFile,
} from "typescript";
import {
	parseExpressionToValue,
	ScopeVarType,
	setTSVisriorConfig,
	TSVisrior,
} from "@thestarweb/ts-helper";
import "./definition.js";
import { SiteOnlyConfig, TypeVisitor } from "./types.js";
import { isKeepInSide } from "./utils/side-check.js";
import { shouldRemoverByComment } from "./utils/comment.js";
import { systemConfig } from "./system-config.js";
import { createClassHandle } from "./handles/class.js";
import { createMethodHandle } from "./handles/method.js";
import { createPropertyHandle } from "./handles/property.js";
import { createTypeReferenceNodeHandle } from "./handles/type-reference-node.js";
import { createCallExpressionHandle } from "./handles/call-expression.js";
export * from "./types.js";

export function crreateSideOnlyVisitor(config: SiteOnlyConfig = {}) {
	const rule = [...systemConfig, ...(config.rules || [])];
	const handelMap: Partial<Record<SyntaxKind, TypeVisitor<any> | undefined>> = {
		[SyntaxKind.ClassDeclaration]: createClassHandle(rule),
		[SyntaxKind.MethodDeclaration]: createMethodHandle(rule),
		[SyntaxKind.PropertyDeclaration]: createPropertyHandle(rule),
		[SyntaxKind.TypeReference]: createTypeReferenceNodeHandle(rule),
		[SyntaxKind.CallExpression]: createCallExpressionHandle(rule),
	};
	let sourceFile: SourceFile;
	return (currentSide: StarFrameworkSide[]) =>
		setTSVisriorConfig(
			(node, factory, scopeHelper) => {
				if (isSourceFile(node)) {
					sourceFile = node;
				} else if (shouldRemoverByComment(currentSide, node)) {
					return undefined as any;
				}
				if (handelMap[node.kind]) {
					return handelMap[node.kind]!(currentSide, node, factory, scopeHelper);
				}
				return node;
			},
			{
				enableScop: true,
				globalScop: Object.fromEntries(
					rule
						.filter((i) =>
							Array.isArray(i.import) ? i.import.includes("") : i.import === "",
						)
						.flatMap((i) => {
							return (Array.isArray(i.name) ? i.name : [i.name]).map((j) => [
								j,
								{
									type: ScopeVarType.Import,
									filePath: "",
									varPath: [j],
								},
							]);
						}),
				),
			},
		);
}
