import {
	isClassDeclaration,
	Node,
	MethodDeclaration,
	isCallExpression,
	isDecorator,
	isIdentifier,
	isStringLiteral,
	PropertyDeclaration,
	ClassDeclaration,
	isMethodDeclaration,
	Expression,
	NodeArray,
	SyntaxKind,
	ModifierLike,
	isPropertyDeclaration,
	isTypeLiteralNode,
	isTypeReferenceNode,
	isObjectLiteralExpression,
	isPropertyAssignment,
	isPropertySignature,
} from "typescript";
import {
	parseExpressionToValue,
	parseLiteralTypeNodeToValue,
} from "@thestarweb/ts-helper";
import "./definition.js";
import { Visrior } from "../i-visitor.js";
import {
	FromArg,
	FromArgWithSelf,
	SiteOnlyConfig,
	SiteOnlyConfigRule,
} from "./types.js";

const defaultRule: SiteOnlyConfigRule[] = [
	{
		import: "",
		name: "SFSideOnly",
		side: { arg: 0 },
		mode: { arg: 1 },
		type: "include",
		importent: Number.MAX_VALUE,
		removeSelf: true,
	},
	{
		import: "",
		name: "SFSideOmit",
		side: { arg: 0 },
		mode: { arg: 1 },
		type: "exclude",
		importent: Number.MAX_VALUE,
		removeSelf: true,
	},
];

export function crreateSideOnlyVisitor(
	side: StarFrameworkSide[],
	config: SiteOnlyConfig = {},
): Visrior {
	const rule = [...defaultRule, ...(config.rules || [])];
	function isKeepInSide<T, F>(
		reqSide: StarFrameworkSide | StarFrameworkSide[],
		type: "exclude" | "include" | "SFSiteOnly" | "SFSiteOmit",
		keepValue: T = true as any,
		omitValue: F = false as any,
	) {
		const isMatchSide = Array.isArray(reqSide)
			? reqSide.some((i) => side.includes(i))
			: side.includes(reqSide);
		// include且isMatchSide时或exclude且!isMatchSide
		const isKeep =
			isMatchSide !== (type === "exclude" || type === "SFSiteOmit");
		return isKeep ? keepValue : omitValue;
	}
	function shouldRemove(
		node: MethodDeclaration | PropertyDeclaration | ClassDeclaration,
	) {
		const removeDecorator = new Set<ModifierLike>();
		const res = node.modifiers
			?.map((m) => {
				if (isDecorator(m)) {
					console.log(111);
					let name = "";
					const args: NodeArray<Expression>[] = [];
					const toRel = <T extends FromArgWithSelf<any>>(
						a: T,
					): T extends FromArg<infer R> ? R : T => {
						if (a && typeof a === "object" && "arg" in a) {
							const { arg } = a;
							if (Array.isArray(arg)) {
								return parseExpressionToValue(args[arg[0]][arg[1]]);
							}
							return parseExpressionToValue(args[0][arg as number]);
						}
						return a as any;
					};
					let t = m.expression;
					while (isCallExpression(t)) {
						args.push(t.arguments);
						t = t.expression;
					}
					console.log(2222);
					if (isIdentifier(t)) {
						console.log(3333);
						name = t.text;
						// TODO：增加从哪导入和重命名的判断
						const item = rule.find((r) => r.name === name);
						if (item) {
							console.log(4444);
							const reqSide = toRel(item.side);
							const isMatchSide = Array.isArray(reqSide);
							console.log(reqSide, item.type || "exclude", false, true);
							const shouldRemove = isKeepInSide(
								reqSide,
								item.type || "exclude",
								false,
								true,
							);
							const mode = toRel(item.mode || "delete") || "delete";
							if (item.removeSelf) {
								removeDecorator.add(m);
							}
							return {
								importent: item.importent || 0,
								shouldRemove,
								mode,
							};
						}
					}
				}
				return null;
			})
			.filter(Boolean)
			.sort((a, b) => (b!.importent || 0) - (a!.importent || 0));
		console.log(res);
		return {
			mode: res?.[0]?.shouldRemove ? res[0].mode : "",
			newDecorator: node.modifiers?.filter((i) => !removeDecorator.has(i)),
		};
	}
	return (node, factory) => {
		if (isClassDeclaration(node)) {
			const t = shouldRemove(node);
			if (t.mode) {
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
			const t = shouldRemove(node);
			if (t.mode) {
				if (t.mode === "throw") {
					return factory.updateMethodDeclaration(
						node,
						t.newDecorator,
						node.asteriskToken,
						node.name,
						node.questionToken,
						node.typeParameters,
						[
							factory.createParameterDeclaration(
								[],
								factory.createToken(SyntaxKind.DotDotDotToken),
								"prop",
								undefined,
								factory.createArrayTypeNode(
									factory.createToken(SyntaxKind.AnyKeyword),
								),
							),
						],
						node.type,
						factory.createBlock([
							factory.createThrowStatement(
								factory.createNewExpression(
									factory.createIdentifier("Error"),
									undefined,
									[
										factory.createStringLiteral(
											"can not call this function in this side!",
										),
									],
								),
							),
						]),
					);
				} else {
					return [];
				}
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
			const t = shouldRemove(node);
			if (t.mode) {
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
					const key = side.find((i) => map[i]);
					return key ? map[key] : factory.createToken(SyntaxKind.NeverKeyword);
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
					const key = side.find((i) => map[i]);
					return key ? map[key] : factory.createIdentifier("undefined");
				}
			}
		}
		return node;
	};
}
