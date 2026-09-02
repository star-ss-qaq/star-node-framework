import { expect, describe, test } from "vitest";
import { RouteMetadata } from "../src/index.js";

describe("路由测试", () => {
	const routeMetadata = new RouteMetadata("t1");
	const Get = routeMetadata.route("get");
	const Post = routeMetadata.route("post");
	const SubRoute = (path: string, context?: any) =>
		routeMetadata.subRoute(path, context);
	test("能正确添加元数据并被解析", async () => {
		class A {
			@Get()
			a() {}
		}
		const a = new A();
		const route = routeMetadata.parse(a);
		const ret = route("get", "/");
		expect(ret).toEqual({
			allRoute: [
				{
					obj: a,
					path: "/",
					propertyKey: "a",
				},
			],
			finalRoute: {
				obj: a,
				propertyKey: "a",
				path: "/",
			},
		});
	});
	test("能够递归解析", async () => {
		class B {
			@Post("bar")
			b() {}
		}
		class A {
			@Get()
			a() {}
			@SubRoute("foo")
			b = new B();
		}
		const a = new A();
		const route = routeMetadata.parse(a);
		const ret = route("get", "/");
		expect(ret).toEqual({
			allRoute: [
				{
					obj: a,
					path: "/",
					propertyKey: "a",
				},
			],
			finalRoute: {
				obj: a,
				propertyKey: "a",
				path: "/",
			},
		});
		const ret2 = route("post", "/foo/bar");
		expect(ret2).toEqual({
			allRoute: [
				{
					obj: a,
					path: "/",
					propertyKey: "b",
				},
				{
					obj: a.b,
					path: "/foo/",
					propertyKey: "b",
				},
			],
			finalRoute: {
				obj: a.b,
				propertyKey: "b",
				path: "/foo/bar",
			},
		});
	});
	test("需要能正确区分同一路径的不同请求方式", async () => {
		class A {
			@Get("some-path")
			getHandle() {}
			@Post("some-path")
			postHandle() {}
		}
		const a = new A();
		const route = routeMetadata.parse(a);
		const retGet = route("get", "/some-path");
		const retPpst = route("post", "/some-path");
		expect(retGet.finalRoute?.propertyKey).toBe("getHandle");
		expect(retPpst.finalRoute?.propertyKey).toBe("postHandle");
	});

	test("在没有确切路由时 应该要能找到最匹配的路由类", async () => {
		class B {}
		class A {
			@SubRoute("foo")
			b = new B();
		}
		const a = new A();
		const route = routeMetadata.parse(a);
		const ret = route("get", "/123");
		expect(ret).toEqual({
			allRoute: [
				{
					obj: a,
					path: "/",
					propertyKey: "",
				},
			],
			params: { _0: "123" },
		});
		const ret2 = route("post", "/foo/bar");
		expect(ret2).toEqual({
			allRoute: [
				{
					obj: a,
					path: "/",
					propertyKey: "b",
				},
				{
					obj: a.b,
					path: "/foo/",
					propertyKey: "",
				},
			],
			params: { _0: "bar" },
		});
	});
	test("需要支持元数据", async () => {
		class A {
			@Get("", { a: 1 })
			a() {}
		}
		const a = new A();
		const route = routeMetadata.parse(a);
		const ret = route("get", "/");
		expect(ret).toEqual({
			allRoute: [
				{
					obj: a,
					path: "/",
					propertyKey: "a",
				},
			],
			finalRoute: {
				obj: a,
				propertyKey: "a",
				path: "/",
				context: {
					a: 1,
				},
			},
		});
	});
	test("Subroute支持元数据", async () => {
		class B {
			@Get("", { a: 1 })
			a() {}
		}
		class A {
			@SubRoute("", { b: 1 })
			b = new B();
		}
		const a = new A();
		const route = routeMetadata.parse(a);
		const ret = route("get", "/");
		expect(ret).toEqual({
			allRoute: [
				{
					obj: a,
					path: "/",
					propertyKey: "b",
				},
				{
					context: {
						b: 1,
					},
					obj: a.b,
					path: "/",
					propertyKey: "a",
				},
			],
			finalRoute: {
				obj: a.b,
				propertyKey: "a",
				path: "/",
				context: {
					a: 1,
				},
			},
		});
	});
});
