import { expect, describe, test } from "vitest";
import {
	createSourceFile,
	ExpressionStatement,
	isCallExpression,
	isIdentifier,
	isImportDeclaration,
	isNewExpression,
	isStringLiteral,
	ScriptTarget,
} from "typescript";
import {
	createTransformerFactoryByTsVistor,
	parseExpressionToValue,
	withTransform,
} from "../src/index.js";

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
				createTransformerFactoryByTsVistor((node, f, scope) => {
					if (isCallExpression(node)) {
						expect(
							scope.parseExpression(node.expression),
							"识别默认导出",
						).toEqual({
							filePath: "b-package",
							type: 2,
							varPath: ["default"],
						});
					}
					if (isNewExpression(node)) {
						expect(
							scope.parseExpression(node.expression),
							"识别命名导出",
						).toEqual({
							filePath: "package-a",
							type: 2,
							varPath: ["A"],
						});
					}
					return node;
				}),
			],
		);
	});
	test("能追踪导入变量的变体", async () => {
		withTransform("import * as a from 'package-a';a.a();const b=a.b;new b()", [
			createTransformerFactoryByTsVistor((node, f, scope) => {
				console.log(scope.scope);
				if (isCallExpression(node)) {
					console.log(scope.scope["a"]);
					expect(
						scope.parseExpression(node.expression),
						"识别import*然后访问属性",
					).toEqual({
						filePath: "package-a",
						type: 2,
						varPath: ["a"],
					});
				}
				if (isNewExpression(node)) {
					expect(
						scope.parseExpression(node.expression),
						"识别绑定到别的变量",
					).toEqual({
						filePath: "package-a",
						type: 2,
						varPath: ["b"],
					});
				}
				return node;
			}),
		]);
	});
});
