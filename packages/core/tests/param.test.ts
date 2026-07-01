import { expect, describe, test } from "vitest";
import { Body, getParamMetadata, Query } from "../src";

describe("参数工具测试", () => {
	test("能够执行基本的参数解析", async () => {
		class A {
			test(@Body() body: { a: string; b?: number }) {}
		}
		const { meta } = getParamMetadata(A.prototype, "test");
		expect(meta).toEqual({
			body: {
				type: {
					type: "object",
					properties: { a: { type: "string" }, b: { type: "number" } },
					required: ["a"],
					additionalProperties: undefined,
					constructor: undefined,
				},
				required: true,
			},
		});
	});
	test("支持联合类型", async () => {
		class A {
			test(@Body() body: string | number) {}
		}
		const { meta } = getParamMetadata(A.prototype, "test");
		expect(meta).toEqual({
			body: {
				type: {
					type: "anyOf",
					anyOf: [{ type: "string" }, { type: "number" }],
				},
				required: true,
			},
		});
	});
	test("支持或类型的合并", async () => {
		enum E1 {
			a = "a",
			b = "b",
		}
		enum E2 {
			b = "b",
			c = "c",
			d = 1,
		}
		class A {
			test1(@Body() body: string | "1") {}
			test2(@Body() body: E1 | E2) {}
			test3(@Body() body: string | E1) {}
			test4(@Body() body: number | E1) {}
			test5(@Body() body: string | E2) {}
		}
		expect(
			getParamMetadata(A.prototype, "test1").meta,
			"最基本的子集合并",
		).toEqual({
			body: {
				type: {
					type: "string",
				},
				required: true,
			},
		});
		expect(
			getParamMetadata(A.prototype, "test2").meta,
			"枚举类型的合并",
		).toEqual({
			body: {
				type: {
					type: "enum",
					values: ["a", "b", "c", 1],
				},
				required: true,
			},
		});
		expect(
			getParamMetadata(A.prototype, "test3").meta,
			"枚举类型与兼容类型的合并",
		).toEqual({
			body: {
				type: {
					type: "string",
				},
				required: true,
			},
		});
		expect(
			getParamMetadata(A.prototype, "test4").meta,
			"不兼容类型不应合并",
		).toEqual({
			body: {
				type: {
					type: "anyOf",
					anyOf: [
						{ type: "number" },
						{
							type: "enum",
							values: Object.freeze(["a", "b"]),
						},
					],
				},
				required: true,
			},
		});
		expect(getParamMetadata(A.prototype, "test5").meta, "部分合并").toEqual({
			body: {
				type: {
					type: "anyOf",
					anyOf: [
						{ type: "string" },
						{
							type: "enum",
							values: Object.freeze([1]),
						},
					],
				},
				required: true,
			},
		});
	});
	test("如果要求一个方法那么应该抛出异常", async () => {
		interface T1 {
			a(): void;
		}
		interface T2 {
			a: () => void;
		}
		interface T3 {
			(): void;
		}
		type T4 = () => void;

		class A {
			test1(@Body() body: T1) {}
			test2(@Body() body: T2) {}
			test3(@Body() body: T3) {}
			test4(@Body() body: T4) {}
			test5(@Body() body: () => void) {}
		}
		expect(() => getParamMetadata(A.prototype, "test1")).toThrow();
		expect(() => getParamMetadata(A.prototype, "test2")).toThrow();
		expect(() => getParamMetadata(A.prototype, "test3")).toThrow();
		expect(() => getParamMetadata(A.prototype, "test4")).toThrow();
		expect(() => getParamMetadata(A.prototype, "test5")).toThrow();
	});
	test("如果是可选的方法则不报错", async () => {
		interface T1 {
			a(): void;
		}
		interface T2 {
			a: () => void;
		}
		interface T3 {
			(): void;
		}
		interface T5 {
			a?: () => void;
		}
		type T4 = () => void;

		class A {
			test1(@Body() body?: T1) {}
			test2(@Body() body?: T2) {}
			test3(@Body() body?: T3) {}
			test4(@Body() body?: T4) {}
			test5(@Body() body: T5) {}
			test6(@Body() body?: () => void) {}
		}
		const neverBody = {
			body: {
				type: {
					type: "never",
				},
				required: false,
			},
		};
		expect(getParamMetadata(A.prototype, "test1").meta).toEqual(neverBody);
		expect(getParamMetadata(A.prototype, "test2").meta).toEqual(neverBody);
		expect(getParamMetadata(A.prototype, "test3").meta).toEqual(neverBody);
		expect(getParamMetadata(A.prototype, "test4").meta).toEqual(neverBody);
		expect(getParamMetadata(A.prototype, "test5").meta).toEqual({
			body: {
				type: {
					type: "object",
					properties: {
						a: { type: "never" },
					},
					required: [],
				},
				required: true,
			},
		});
		expect(getParamMetadata(A.prototype, "test6").meta).toEqual(neverBody);
	});
	test("支持参数合并", async () => {
		class A {
			test(
				@Body() body: { a: string },
				@Body("b") b: string,
				@Body() body2: { c?: string },
				@Body("d") d?: string,
			) {}
		}
		const { meta } = getParamMetadata(A.prototype, "test");
		expect(meta).toEqual({
			body: {
				type: {
					type: "object",
					properties: {
						a: { type: "string" },
						b: { type: "string" },
						c: { type: "string" },
						d: { type: "string" },
					},
					required: ["a", "b"],
				},
				required: true,
			},
		});
	});
	test("需要能识别构造函数", async () => {
		class B {
			a!: string;
		}
		class A {
			test(@Body() body: B) {}
		}
		const { meta } = getParamMetadata(A.prototype, "test");
		expect(meta).toEqual({
			body: {
				type: {
					type: "object",
					properties: {
						a: { type: "string" },
					},
					required: ["a"],
					constructor: B,
				},
				required: true,
			},
		});
	});
	test("需要能识别Set", async () => {
		class A {
			test(@Body() body: Set<string>) {}
		}
		const { meta } = getParamMetadata(A.prototype, "test");
		expect(meta).toEqual({
			body: {
				type: {
					type: "array",
					items: { type: "string" },
					metchType: Set,
				},
				required: true,
			},
		});
	});
	test("需要能识别Map", async () => {
		class A {
			test(@Body() body: Map<string, string>) {}
		}
		const { meta } = getParamMetadata(A.prototype, "test");
		expect(meta).toEqual({
			body: {
				type: {
					type: "object",
					properties: {},
					required: [],
					additionalProperties: {
						type: "string",
					},
				},
				required: true,
			},
		});
	});
	test("需要能识别Set的继承", async () => {
		class B extends Set<string> {}
		class C extends B {}
		class A {
			test1(@Body() body: B) {}
			test2(@Body() body: C) {}
		}
		expect(getParamMetadata(A.prototype, "test1").meta).toEqual({
			body: {
				type: {
					type: "array",
					items: { type: "string" },
					constructor: B,
					metchType: Set,
				},
				required: true,
			},
		});
		expect(getParamMetadata(A.prototype, "test2").meta).toEqual({
			body: {
				type: {
					type: "array",
					items: { type: "string" },
					constructor: C,
					metchType: Set,
				},
				required: true,
			},
		});
	});
	test("需要能识别Map的继承", async () => {
		class B<T> extends Map<string, T> {}
		class C extends B<string> {}
		class A {
			test1(@Body() body: B<string>) {}
			test2(@Body() body: C) {}
		}
		expect(getParamMetadata(A.prototype, "test1").meta).toEqual({
			body: {
				type: {
					type: "object",
					properties: {},
					required: [],
					constructor: B,
					additionalProperties: {
						type: "string",
					},
				},
				required: true,
			},
		});
		expect(getParamMetadata(A.prototype, "test2").meta).toEqual({
			body: {
				type: {
					type: "object",
					properties: {},
					required: [],
					constructor: C,
					additionalProperties: {
						type: "string",
					},
				},
				required: true,
			},
		});
	});
	test("不相容参数需要报错", async () => {
		class A {
			test1(@Body() body: { a: string }, @Body("a") a: number) {}
			test2(@Body() body: { a: string }, @Body() b: { a: number }) {}
			test3(@Body() body: A, @Body() b: B) {}
		}
		class B {}
		class C {}
		expect(() => getParamMetadata(A.prototype, "test1")).toThrowError();
		expect(() => getParamMetadata(A.prototype, "test2")).toThrowError();
		expect(() => getParamMetadata(A.prototype, "test3")).toThrowError();
	});
});
