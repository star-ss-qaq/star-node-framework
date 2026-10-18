import { expect, describe, test } from "vitest";
import { SFDB } from "../src/index.js";
import { baseSchema } from "./base/schema.js";
import { checkSql } from "./base/utils.js";

describe("测试DELETE语句拼接", () => {
	const db = new SFDB(baseSchema, { type: "test-only" });
	test("最基础的删除", async () => {
		checkSql(
			db.delete("user").where("id", "=", 1).toSql(),
			"DELETE FROM `test`.`user` AS `user` WHERE `user`.`id` = ?",
			[1],
		);
	});
});
