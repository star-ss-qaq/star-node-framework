import {
	parseExpressionToValue,
	parseLiteralTypeNodeToValue,
} from "@thestarweb/ts-helper";
import { SiteOnlyConfigRule } from "./types.js";
import { isKeepInSide } from "./utils/side-check.js";
import {
	Expression,
	isIdentifier,
	isObjectLiteralExpression,
	isPropertyAssignment,
	isPropertySignature,
	isStringLiteral,
	isTypeLiteralNode,
	Node,
	SyntaxKind,
	TypeNode,
} from "typescript";

export const systemConfig: SiteOnlyConfigRule[] = [
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
		name: "SFSideOnly",
		side: [], // 设置side为空数组和inclulde模式让规则始终生效然后再自定义判断
		whenTypeReferenceNode: {
			mode: "customize",
			customizeHandle: (node, currentSide, factory) => {
				if (node.typeArguments?.length !== 2)
					throw new Error(`SFSideOnly must with 2 type arguments`);
				const side = parseLiteralTypeNodeToValue<
					StarFrameworkSide | StarFrameworkSide[]
				>(node.typeArguments[0]);
				return isKeepInSide(
					currentSide,
					side,
					"include",
					node.typeArguments[1],
					factory.createToken(SyntaxKind.NeverKeyword),
				);
			},
		},

		whenCallExpression: {
			mode: "customize",
			customizeHandle: (node, currentSide, factory) => {
				if (node.arguments?.length !== 2)
					throw new Error(`SFSideOnly must with 2 type arguments`);
				const side = parseExpressionToValue<
					StarFrameworkSide | StarFrameworkSide[]
				>(node.arguments[0]);
				return isKeepInSide(
					currentSide,
					side,
					"include",
					node.arguments[1],
					factory.createIdentifier("undefined"),
				);
			},
		},
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
	{
		import: "",
		name: "SFSideOmit",
		side: [],
		whenTypeReferenceNode: {
			mode: "customize",
			customizeHandle: (node, currentSide, factory) => {
				if (node.typeArguments?.length !== 2)
					throw new Error(`SFSideOmit must with 2 type arguments`);
				const side = parseLiteralTypeNodeToValue<
					StarFrameworkSide | StarFrameworkSide[]
				>(node.typeArguments[0]);
				return isKeepInSide(
					currentSide,
					side,
					"exclude",
					node.typeArguments[1],
					factory.createToken(SyntaxKind.NeverKeyword),
				);
			},
		},
		whenCallExpression: {
			mode: "customize",
			customizeHandle: (node, currentSide, factory) => {
				if (node.arguments?.length !== 2)
					throw new Error(`SFSideOmit must with 2 type arguments`);
				const side = parseExpressionToValue<
					StarFrameworkSide | StarFrameworkSide[]
				>(node.arguments[0]);
				return isKeepInSide(
					currentSide,
					side,
					"exclude",
					node.arguments[1],
					factory.createIdentifier("undefined"),
				);
			},
		},
		type: "include",
		importent: Number.MAX_VALUE,
	},
	{
		import: "",
		name: "SFSiteSwith",
		side: [],
		whenTypeReferenceNode: {
			mode: "customize",
			customizeHandle: (node, currentSide, factory) => {
				if (
					node.typeArguments?.length !== 1 ||
					!isTypeLiteralNode(node.typeArguments[0])
				) {
					throw new Error("SFSiteSwith need 1 literal argument");
				}
				const map: Record<string, TypeNode> = {};
				node.typeArguments[0].members.forEach((c) => {
					if (isPropertySignature(c)) {
						if (isIdentifier(c.name) || isStringLiteral(c.name)) {
							map[c.name.text] = c.type!;
						}
					}
				});
				const key = currentSide.find((i) => map[i]);
				return key ? map[key] : factory.createToken(SyntaxKind.NeverKeyword);
			},
		},
		whenCallExpression: {
			mode: "customize",
			customizeHandle: (node, currentSide, factory) => {
				if (
					node.arguments?.length !== 1 ||
					!isObjectLiteralExpression(node.arguments[0])
				) {
					throw new Error("SFSiteSwith need 1 literal argument");
				}
				const map: Record<string, Expression> = {};
				node.arguments[0].properties.forEach((c) => {
					if (isPropertyAssignment(c)) {
						if (isIdentifier(c.name) || isStringLiteral(c.name)) {
							map[c.name.text] = c.initializer;
						}
					}
				});
				const key = currentSide.find((i) => map[i]);
				return key ? map[key] : factory.createIdentifier("undefined");
			},
		},
		type: "include",
		importent: Number.MAX_VALUE,
	},
];
