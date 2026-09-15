import { expect, describe, test } from "vitest";
import {
	createSourceFile,
	ExpressionStatement,
	isCallExpression,
	isIdentifier,
	isImportDeclaration,
	isNewExpression,
	isStringLiteral,
	isTypeReferenceNode,
	ScriptTarget,
} from "typescript";
import {
	createTransformerFactoryByTsVistor,
	parseExpressionToValue,
	ScopeVarType,
	setTSVisriorConfig,
	TSVisrior,
	withTransform,
} from "../src/index.js";
import { ScopeVar } from "../src/ast/visiter/type.js";

describe("expression读取", () => {
	function toAST(value: string) {
		const sf = createSourceFile("", value, ScriptTarget.ESNext);
		return (sf.statements[0] as ExpressionStatement).expression;
	}
	test("字符串表达式解析", async () => {
		expect(parseExpressionToValue(toAST('"hello wprld"'))).toBe("hello wprld");
	});
	test("数字表达式解析", async () => {
		expect(parseExpressionToValue(toAST("1234"))).toBe(1234);
	});
	test("布尔表达式解析", async () => {
		expect(parseExpressionToValue(toAST("true"))).toBe(true);
		expect(parseExpressionToValue(toAST("false"))).toBe(false);
	});
	test("数组解析", async () => {
		expect(parseExpressionToValue(toAST("[]"))).toEqual([]);
		expect(parseExpressionToValue(toAST("['1',2,false]"))).toEqual([
			"1",
			2,
			false,
		]);
	});
});
describe("visiter工具", () => {
	test("需要能正确遍历到所有节点", async () => {
		enum Type {
			ImportDeclaration = "ImportDeclaration",
			Identifier = "Identifier",
			StringLiteral = "StringLiteral",
		}
		const findArr: Type[] = [];
		withTransform("import a from 'a';", [
			createTransformerFactoryByTsVistor((node) => {
				if (isImportDeclaration(node)) {
					findArr.push(Type.ImportDeclaration);
				} else if (isIdentifier(node)) {
					findArr.push(Type.Identifier);
				} else if (isStringLiteral(node)) {
					findArr.push(Type.StringLiteral);
				}
				return node;
			}),
		]);
		expect(findArr).toEqual(Object.values(Type));
	});
	test("能感知导入的变量", async () => {
		withTransform(
			"import {A} from 'package-a';import b from 'b-package';import c from 'c';b();new A();",
			[
				createTransformerFactoryByTsVistor(
					setTSVisriorConfig(
						(node, f, scope) => {
							if (isCallExpression(node)) {
								expect(
									scope.parseExpression(node.expression),
									"识别默认导出",
								).toEqual({
									filePath: "b-package",
									type: ScopeVarType.Import,
									varPath: ["default"],
								});
							}
							if (isNewExpression(node)) {
								expect(
									scope.parseExpression(node.expression),
									"识别命名导出",
								).toEqual({
									filePath: "package-a",
									type: ScopeVarType.Import,
									varPath: ["A"],
								});
							}
							return node;
						},
						{ enableScop: true },
					),
				),
			],
		);
	});
	test("能追踪导入变量的变体", async () => {
		withTransform("import * as a from 'package-a';a.a();const b=a.b;new b()", [
			createTransformerFactoryByTsVistor(
				setTSVisriorConfig(
					(node, f, scope) => {
						if (isCallExpression(node)) {
							expect(
								scope.parseExpression(node.expression),
								"识别import*然后访问属性",
							).toEqual({
								filePath: "package-a",
								type: ScopeVarType.Import,
								varPath: ["a"],
							});
						}
						if (isNewExpression(node)) {
							expect(
								scope.parseExpression(node.expression),
								"识别绑定到别的变量",
							).toEqual({
								filePath: "package-a",
								type: ScopeVarType.Import,
								varPath: ["b"],
							});
						}
						return node;
					},
					{ enableScop: true },
				),
			),
		]);
	});
	test("能追踪自定义的全局变量", async () => {
		const globalADefain: ScopeVar = {
			type: ScopeVarType.Customize,
			meta: "test",
		};
		const globalDefain: ScopeVar = {
			type: ScopeVarType.Record,
			value: { a: globalADefain },
		};
		withTransform("global();new global.a()", [
			createTransformerFactoryByTsVistor(
				setTSVisriorConfig(
					(node, f, scope) => {
						if (isCallExpression(node)) {
							expect(
								scope.parseExpression(node.expression),
								"识别直接访问",
							).toEqual(globalDefain);
						}
						if (isNewExpression(node)) {
							expect(
								scope.parseExpression(node.expression),
								"识别属性访问",
							).toEqual(globalADefain);
						}
						return node;
					},
					{
						enableScop: true,
						globalScop: {
							global: globalDefain,
						},
					},
				),
			),
		]);
	});
	test("能追踪类型定义", async () => {
		const globalADefain: ScopeVar = {
			type: ScopeVarType.Customize,
			meta: "test",
		};
		const globalDefain: ScopeVar = {
			type: ScopeVarType.Record,
			value: { a: globalADefain },
		};
		withTransform("let a:global;", [
			createTransformerFactoryByTsVistor(
				setTSVisriorConfig(
					(node, f, scope) => {
						if (isTypeReferenceNode(node)) {
							expect(scope.parseExpression(node.typeName), "带.的访问").toEqual(
								globalDefain,
							);
						}
						return node;
					},
					{
						enableScop: true,
						globalScop: {
							global: globalDefain,
						},
					},
				),
			),
		]);
		withTransform("let a:global.a;", [
			createTransformerFactoryByTsVistor(
				setTSVisriorConfig(
					(node, f, scope) => {
						if (isTypeReferenceNode(node)) {
							expect(
								scope.parseExpression(node.typeName),
								"识别直接访问",
							).toEqual(globalADefain);
						}
						return node;
					},
					{
						enableScop: true,
						globalScop: {
							global: globalDefain,
						},
					},
				),
			),
		]);
	});
});
