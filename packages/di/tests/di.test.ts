import { expect, describe, test } from "vitest";
import { DIContainer, Inject, Module, diCreate } from "../src";

describe("DI容器测试", () => {
	test("能够创建第一个实例", async () => {
		class A {}
		const instance = await diCreate(A);
		expect(instance).toBeInstanceOf(A);
	});
	test("能够解析依赖", async () => {
		class B {}
		class A {
			constructor(public b: B) {}
			@Inject()
			b2!: B;
		}
		const instance = await diCreate(A);
		expect(instance).toBeInstanceOf(A);
		expect(instance?.b).toBeInstanceOf(B);
		expect(instance?.b2).toBeInstanceOf(B);
	});
	test("构造函数循环依赖，且依赖必选时，需要报错", async () => {
		class B {
			constructor(public a: A) {}
		}
		class A {
			constructor(public b: B) {}
		}
		await expect(diCreate(A)).rejects.toThrow();
	});
	test("构造函数循环依赖，且依赖可选时，应该正常执行", async () => {
		class B {
			constructor(public a?: A) {}
		}
		class A {
			constructor(public b: B) {}
		}
		const instance = await diCreate(A);
		expect(instance).toBeInstanceOf(A);
		expect(instance?.b).toBeInstanceOf(B);
		expect(instance?.b.a).toBeUndefined();
	});
	test("属性注入循环依赖应该是可以通过的", async () => {
		class B {
			@Inject()
			public a!: A;
		}
		class A {
			@Inject()
			public b!: B;
		}
		const instance = await diCreate(A);
		expect(instance).toBeInstanceOf(A);
		expect(instance?.b).toBeInstanceOf(B);
		expect(instance?.b.a).toBeInstanceOf(A);
	});
	test("应当能获取到容器", async () => {
		class A {
			@Inject()
			c!: DIContainer;
		}
		const instance = await diCreate(A);
		expect(instance).toBeInstanceOf(A);
		expect(instance?.c).toBeInstanceOf(DIContainer);
		expect(await instance?.c.resolve(A)).toBe(instance);
	});
	test("应当能支持值的注入", async () => {
		@Module({ providers: [{ token: "hello", value: "world" }] })
		class A {
			@Inject("hello")
			d!: string;
		}
		const instance = await diCreate(A);
		expect(instance).toBeInstanceOf(A);
		expect(instance?.d).toBe("world");
	});
	test("应当能支持工厂函数注入", async () => {
		class B {
			str = "world";
		}
		@Module({
			providers: [
				{
					token: "hello",
					factory(obj: B) {
						return obj.str;
					},
				},
			],
		})
		class A {
			@Inject("hello")
			d!: string;
		}
		const instance = await diCreate(A);
		expect(instance?.d).toBe("world");
	});
	test("应当能支持工厂函数的inject注入", async () => {
		@Module({
			providers: [
				{
					token: "foo",
					value: "bar",
				},
				{
					token: "hello",
					inject: ["foo"],
					factory(str: string) {
						return str;
					},
				},
			],
		})
		class A {
			@Inject("hello")
			d!: string;
		}
		const instance = await diCreate(A);
		expect(instance?.d).toBe("bar");
	});
	test("应当能支持工厂函数提供者简写", async () => {
		class B {
			str = "world";
		}
		function factory(obj: B) {
			return obj.str;
		}
		@Module({
			providers: [factory],
		})
		class A {
			@Inject(factory)
			d!: string;
		}
		const instance = await diCreate(A);
		expect(instance?.d).toBe("world");
	});
	test("应当避免并发导致对象不一致", async () => {
		class C {}
		class D {
			constructor(public c: C) {}
		}
		@Module()
		class A {
			constructor(
				public c: C,
				public d: D,
			) {}
		}
		const instance = (await diCreate(A))!;
		expect(instance.c).toBe(instance.d.c);
	});
	test("应当支持独立的空间", async () => {
		class C {}
		class D {
			constructor(public c: C) {}
		}
		class E {}
		@Module({ providers: [C, D] })
		class B {
			constructor(
				public c: C,
				public d: D,
				public e: E,
			) {}
		}
		@Module()
		class A {
			constructor(
				public b: B,
				public c: C,
				public d: D,
				public e: E,
			) {}
		}
		const instance = (await diCreate(A))!;
		expect(instance.c).toBe(instance.d.c);
		expect(instance.b.c).toBe(instance.b.d.c);
		expect(instance.b.c).not.toBe(instance.c);
		expect(instance.b.d).not.toBe(instance.d);
		// E不在B的模块中 向上到根模块查找
		expect(instance.b.e).toBe(instance.e);
	});
});
