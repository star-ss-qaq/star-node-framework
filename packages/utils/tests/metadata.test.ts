import { expect, describe, test } from "vitest";
import { getMetadata, initMetadata } from "../src/index.js";

describe("元数据测试", () => {
	test("注入的数据能正确读取，但不应被枚举", async () => {
		const obj: any = Object.create(null);
		initMetadata(obj, "test").test = "ok";
		expect(Object.keys(obj).length, "不应被枚举").toBe(0);
		expect(Object.keys(obj).includes("test"), "不应被枚举").toBe(false);
		expect(getMetadata(obj, "test").test, "对象的数据应该被正确读取").toBe(
			"ok",
		);
		expect(
			initMetadata(obj, "test").test,
			"重新调用initMetadata方法时需要返回之前的数据",
		).toBe("ok");
	});
});
