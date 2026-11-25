import { expect, describe, test } from "vitest";
import { SFDB } from "../src/index.js";
import { baseSchema } from "./base/schema.js";
import { checkSql } from "./base/utils.js";

describe("测试DELETE语句拼接", () => {
	const db = new SFDB(baseSchema, { type: "test-only" });
	test("最基础的删除", async () => {
		expect(await db.structHelper.getDbUpdateSql()).toBe(
			[
				"CREATE DATABASE `test`;",
				"use `test`;",
				"CREATE TABLE `user` (`id` REAL NOT NULL,`name` TEXT NOT NULL,`create_time` INT NOT NULL,`last_login_time` INT NULL DEFAULT 0);",
				"CREATE TABLE `user_data` (`uid` REAL NOT NULL,`data` TEXT NOT NULL)",
			].join("\n"),
		);
	});
});
