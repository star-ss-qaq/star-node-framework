import { expect, describe, test, vi } from "vitest";
import { Command } from "../src/command.js";
import { buildApp } from "../src/build-app.js";
import { Options } from "../src/params.js";

describe("命令识别逻辑测试", () => {
	test("应该能正确路由到命令", async () => {
		let number = 0;
		class App {
			@Command()
			a() {
				number = -1;
			}
			@Command("set2")
			b() {
				number = 2;
			}
		}
		const app = buildApp(new App());
		app(["", ""]);
		expect(number).toBe(-1);

		app(["", "", "set2"]);
		expect(number).toBe(2);
	});
	test("应该能正确识别选项", async () => {
		let number = 0;
		class App {
			@Command()
			a(@Options() arg: number) {
				number = arg;
			}
		}
		const app = buildApp(new App());
		app(["", "", "--arg", "10"]);
		expect(number).toBe(10);
		app(["", "", "--arg", "666"]);
		expect(number).toBe(666);
		expect(
			app(["", "", "--arg", "abc"]),
			"如果传入无效数值应该不能执行",
		).rejects.toThrow();
	});
});
