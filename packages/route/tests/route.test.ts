import { expect, describe, test } from "vitest";
import { Get, Post, SubRoute } from "../src/index.js";
import { routeFinder } from "../src/route-finder.js";

describe("路由测试", () => {
	test("能正确添加元数据并被解析", async () => {
		class A {
			@Get()
			a() {}
		}
		const a = new A();
		const route = routeFinder(a);
		const ret = route("get", "/");
		expect(ret).toEqual({
			obj: a,
			callMode: "get",
			method: "a",
			allObj: [a],
			path: "/",
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
		const route = routeFinder(a);
		const ret = route("get", "/");
		expect(ret).toEqual({
			obj: a,
			callMode: "get",
			method: "a",
			allObj: [a],
			path: "/",
		});
		const ret2 = route("post", "/foo/bar");
		expect(ret2).toEqual({
			obj: a.b,
			callMode: "post",
			method: "b",
			allObj: [a, a.b],
			path: "/foo/bar",
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
		const route = routeFinder(a);
		const retGet = route("get", "/some-path");
		const retPpst = route("post", "/some-path");
		expect(retGet?.method).toBe("getHandle");
		expect(retPpst?.method).toBe("postHandle");
	});
});
