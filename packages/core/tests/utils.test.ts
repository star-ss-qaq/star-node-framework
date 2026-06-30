import { expect, describe, test } from "vitest";
import { initMetadata } from "../src/utils";

describe("基础工具函数测试", () => {
	test("initMetadata注入的数据能正确读取，但不应被枚举", async () => {
		const obj: any = {};
		initMetadata(obj, "test").test = "ok";
		expect(obj, "对象上应该已经添加了对应的元数据").toHaveProperty("test");
		expect(initMetadata(obj, "test").test, "对象的数据应该被正确读取").toBe(
			"ok",
		);
		expect(Object.keys(obj).includes("test")).toBe(false);
	});
});
