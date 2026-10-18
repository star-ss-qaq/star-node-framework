import { expect, describe, test } from "vitest";
import { SFDB } from "../src/index.js";
import { baseSchema } from "./base/schema.js";
import { checkSql } from "./base/utils.js";

describe("测试UPDATE语句拼接", () => {
	const db = new SFDB(baseSchema, { type: "test-only" });
	test("最基础的插入", async () => {
		const now = new Date();
		checkSql(
			db.update("user").set({ id: 1 }).set("name", 233).where("id", 0).toSql(),
			"UPDATE `test`.`user` AS user `id` = ?, `name` = ? WHERE `user`.`id` = ?",
			[1, 233, 0],
		);
	});
});
