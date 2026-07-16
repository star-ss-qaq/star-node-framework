import { expect, describe, test } from "vitest";
import {
	createSourceFile,
	ExpressionStatement,
	ScriptTarget,
} from "typescript";
import { parseExpressionToValue } from "../src/index.js";

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
