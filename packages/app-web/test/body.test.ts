import { expect, test } from "vitest";
import { JSONBody } from "../src/server/body/json.js";
import { Readable } from "stream";

test("JSONBody", async () => {
	const p = JSONBody({ "content-type": "application/json" }, { type: "any" })!;
	async function check(name: string, data: any, str?: string) {
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					new TextEncoder().encode(str || JSON.stringify(data)),
				);
				controller.close();
			},
		});
		expect(await p(stream), name).toEqual(data);
	}
	await check("string 最基础的字符串", "awa");
	await check("string 带有常规转义字符的字符串", "1\r\n3dw\t");
	await check("null", null);
	await check("true", true);
	await check("false", false);
	await check("arrar 空数组", []);
	await check("arrar 有内容数组", ["ewf"]);
	await check("object 空对象", {});
	await check("object 有内容的对象", { a: "123456" });
	await check("整数", 123);
	await check("嵌套", [{ a: 1, b: "666", c: [true, null] }]);
});
