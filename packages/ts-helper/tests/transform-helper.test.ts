import { expect, describe, test } from "vitest";
import { createTransformTool, parseExpressionToValue } from "../src/index.js";

describe("ts转换器测试", () => {
	test("能够完成基本的操作，切保留原始类型", async () => {
		const t = createTransformTool([
			(c) => (sf) =>
				c.factory.updateSourceFile(sf, [
					...sf.statements,
					c.factory.createExpressionStatement(
						c.factory.createNumericLiteral(1234),
					),
				]),
		]);
		expect(t("let a: string;").code).toBe("let a: string;\n1234;\n");
	});
});
