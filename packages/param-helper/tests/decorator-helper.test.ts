import { expect, describe, test } from "vitest";
import { ParamMetaHelper, RootParamType } from "../src/index.js";

describe("测试创建Decorator的能力", () => {
	test("默认支持path", async () => {
		const httpParamMeta = new ParamMetaHelper("default", {
			body: RootParamType.Any,
		});
		const Body = httpParamMeta.createDecorator("body");
		class A {
			test(@Body("a") body: string) {}
		}
		const typeinfo = {
			type: {
				type: "object",
				properties: { a: { type: "string" } },
				required: ["a"],
				additionalProperties: undefined,
				constructor: undefined,
			},
			required: true,
		};
		expect(httpParamMeta.getParamMetadata(A.prototype, "test").types).toEqual({
			body: typeinfo,
		});
	});
	test("Single类型时第一个参数是exMeta", async () => {
		const httpParamMeta = new ParamMetaHelper("default", {
			body: RootParamType.Single,
		});
		const Body = httpParamMeta.createDecorator("body");
		class A {
			test(
				@Body(
					// @ts-ignore
					"a",
				)
				body: string,
			) {}
		}
		const typeinfo = {
			type: {
				type: "string",
			},
			required: true,
		};
		expect(httpParamMeta.getParamMetadata(A.prototype, "test").types).toEqual({
			body: typeinfo,
		});
	});
	test("自定义参数转换", async () => {
		const httpParamMeta = new ParamMetaHelper("default", {
			body: RootParamType.SingleObject,
		});
		const Body = httpParamMeta.createDecorator(
			"body",
			({ name }: { name: string }) => ({ path: name }),
		);
		class A {
			test(@Body({ name: "a" }) body: string) {}
		}
		expect(httpParamMeta.getParamMetadata(A.prototype, "test").types).toEqual({
			body: {
				type: {
					type: "object",
					properties: { a: { type: "string" } },
					required: ["a"],
					additionalProperties: undefined,
					constructor: undefined,
				},
				required: true,
			},
		});
	});
});
