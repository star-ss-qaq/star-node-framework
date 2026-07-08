import { expect, describe, test } from "vitest";
import { ParamMetaHelper, RootParamType } from "../src/index.js";

describe("测试命名空间", () => {
	test("两个命名空间应该相互独立", async () => {
		const httpParamMeta = new ParamMetaHelper("http", {
			body: RootParamType.Any,
		});
		const Body = httpParamMeta.createDecorator("body");
		const cliParamMeta = new ParamMetaHelper("cli", {
			options: RootParamType.SingleObject,
		});
		const Options = cliParamMeta.createDecorator("options");
		class A {
			test(@Body() @Options() body: { a: string; b?: number }) {}
		}
		const typeinfo = {
			type: {
				type: "object",
				properties: { a: { type: "string" }, b: { type: "number" } },
				required: ["a"],
				additionalProperties: undefined,
				constructor: undefined,
			},
			required: true,
		};
		expect(httpParamMeta.getParamMetadata(A.prototype, "test").types).toEqual({
			body: typeinfo,
		});
		expect(cliParamMeta.getParamMetadata(A.prototype, "test").types).toEqual({
			options: typeinfo,
		});
	});
});
