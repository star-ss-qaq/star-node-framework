import {
	isClassDeclaration,
	Node,
	MethodDeclaration,
	isCallExpression,
	isIdentifier,
	isStringLiteral,
	isMethodDeclaration,
	SyntaxKind,
	ModifierLike,
	isPropertyDeclaration,
	isTypeLiteralNode,
	isTypeReferenceNode,
	isObjectLiteralExpression,
	isPropertyAssignment,
	isPropertySignature,
	SourceFile,
	isSourceFile,
} from "typescript";
import {
	parseExpressionToValue,
	parseLiteralTypeNodeToValue,
	ScopeVarType,
	setTSVisriorConfig,
} from "@thestarweb/ts-helper";
import "./definition.js";
import { SiteOnlyConfig, SiteOnlyConfigRule } from "./types.js";
import { isKeepInSide } from "./utils/side-check.js";
import { shouldRemoveAsDeclaration } from "./utils/declaration-helper.js";
import { shouldRemoverByComment } from "./utils/comment.js";
import { removeMethod } from "./utils/remove-method.js";
export * from "./types.js";
const defaultRule: SiteOnlyConfigRule[] = [
	{
		import: "",
		name: "SFSideOnly",
		side: { arg: 0 },
		whenDecorator: { alwaysRemoveSelf: true },
		whenClassDecorator: { alwaysRemoveSelf: true },
		whenMethodDeclaration: {
			alwaysRemoveSelf: true,
			removeMode: { arg: 1, default: "all" },
		},
		whenPropertyDeclaration: { alwaysRemoveSelf: true },
		type: "include",
		importent: Number.MAX_VALUE,
	},
	{
		import: "",
		name: "SFSideOmit",
		side: { arg: 0 },
		whenDecorator: { alwaysRemoveSelf: true },
		whenClassDecorator: { alwaysRemoveSelf: true },
		whenMethodDeclaration: {
			alwaysRemoveSelf: true,
			removeMode: { arg: 1, default: "all" },
		},
		whenPropertyDeclaration: { alwaysRemoveSelf: true },
		type: "exclude",
		importent: Number.MAX_VALUE,
	},
];

export function crreateSideOnlyVisitor(
	currentSide: StarFrameworkSide[],
	config: SiteOnlyConfig = {},
) {
	const rule = [...defaultRule, ...(config.rules || [])];

	let sourceFile: SourceFile;
	return setTSVisriorConfig(
		(node, factory, scopeHelper) => {
			if (isSourceFile(node)) {
				sourceFile = node;
			} else if (shouldRemoverByComment(currentSide, node)) {
				return undefined as any;
			}
			if (isClassDeclaration(node)) {
				const t = shouldRemoveAsDeclaration(
					currentSide,
					rule,
					node,
					"whenClassDecorator",
					scopeHelper,
				);
				if (t.shouldRemove) {
					return factory.updateClassDeclaration(
						node,
						t.newDecorator,
						node.name,
						node.typeParameters,
						node.heritageClauses,
						[],
					);
				} else if (t.newDecorator?.length != node.modifiers?.length) {
					return factory.updateClassDeclaration(
						node,
						t.newDecorator,
						node.name,
						node.typeParameters,
						node.heritageClauses,
						node.members,
					);
				}
			} else if (isMethodDeclaration(node)) {
				const t = shouldRemoveAsDeclaration(
					currentSide,
					rule,
					node,
					"whenMethodDeclaration",
					scopeHelper,
				);
				if (t.shouldRemove) {
					const config = t.rawRule.whenMethodDeclaration;
					const removeMode = config?.removeMode
						? t.toRel(config.removeMode)
						: undefined;
					return removeMethod(
						removeMode || "all",
						node,
						factory,
						t.newDecorator,
					);
				} else if (t.newDecorator?.length != node.modifiers?.length) {
					return factory.updateMethodDeclaration(
						node,
						t.newDecorator,
						node.asteriskToken,
						node.name,
						node.questionToken,
						node.typeParameters,
						node.parameters,
						node.type,
						node.body,
					);
				}
			} else if (isPropertyDeclaration(node)) {
				const t = shouldRemoveAsDeclaration(
					currentSide,
					rule,
					node,
					"whenPropertyDeclaration",
					scopeHelper,
				);
				if (t.shouldRemove) {
					return [];
				} else if (t.newDecorator?.length != node.modifiers?.length) {
					return factory.updatePropertyDeclaration(
						node,
						t.newDecorator,
						node.name,
						node.questionToken || node.exclamationToken,
						node.type,
						node.initializer,
					);
				}
			} else if (isTypeReferenceNode(node)) {
				if (isIdentifier(node.typeName)) {
					const name = node.typeName.text;
					if (name === "SFSiteOnly" || name === "SFSiteOmit") {
						if (node.typeArguments?.length !== 2)
							throw new Error(`${name} must with 2 type arguments`);
						const side = parseLiteralTypeNodeToValue<
							StarFrameworkSide | StarFrameworkSide[]
						>(node.typeArguments[0]);
						return isKeepInSide(
							currentSide,
							side,
							name,
							node.typeArguments[1],
							factory.createToken(SyntaxKind.NeverKeyword),
						);
					}
					if (name === "SFSiteSwith") {
						if (
							node.typeArguments?.length !== 1 ||
							!isTypeLiteralNode(node.typeArguments[0])
						) {
							throw new Error("SFSiteSwith need 1 literal argument");
						}
						const map: Record<string, Node> = {};
						node.typeArguments[0].members.forEach((c) => {
							if (isPropertySignature(c)) {
								if (isIdentifier(c.name) || isStringLiteral(c.name)) {
									map[c.name.text] = c.type!;
								}
							}
						});
						const key = currentSide.find((i) => map[i]);
						return key
							? map[key]
							: factory.createToken(SyntaxKind.NeverKeyword);
					}
				}
			} else if (isCallExpression(node)) {
				if (isIdentifier(node.expression)) {
					const name = node.expression.text;
					if (name === "SFSiteOnly" || name === "SFSiteOmit") {
						if (node.arguments?.length !== 2)
							throw new Error(`${name} must with 2 type arguments`);
						const side = parseExpressionToValue<
							StarFrameworkSide | StarFrameworkSide[]
						>(node.arguments[0]);
						return isKeepInSide(
							currentSide,
							side,
							name,
							node.arguments[1],
							factory.createIdentifier("undefined"),
						);
					} else if (name === "SFSiteSwith") {
						if (
							node.arguments?.length !== 1 ||
							!isObjectLiteralExpression(node.arguments[0])
						) {
							throw new Error("SFSiteSwith need 1 literal argument");
						}
						const map: Record<string, Node> = {};
						node.arguments[0].properties.forEach((c) => {
							if (isPropertyAssignment(c)) {
								if (isIdentifier(c.name) || isStringLiteral(c.name)) {
									map[c.name.text] = c.initializer;
								}
							}
						});
						const key = currentSide.find((i) => map[i]);
						return key ? map[key] : factory.createIdentifier("undefined");
					}
				}
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
