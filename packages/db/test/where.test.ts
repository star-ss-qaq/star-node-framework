import { expect, describe, test } from "vitest";
import { SFDB, Column, Or, Raw } from "../src/index.js";
import { baseSchema } from "./base/schema.js";
import { checkSql } from "./base/utils.js";

describe("where条件", () => {
	const db = new SFDB(baseSchema, { type: "test-only" });

	test("where条件", async () => {
		checkSql(
			db.select("user").addSelect("createTime").where("name", "hello").toSql(),
			"SELECT `user`.`create_time` AS `createTime` FROM `test`.`user` AS `user` WHERE `user`.`name` = ?",
			["hello"],
		);
		checkSql(
			db.select("user").addSelect("createTime").where("id", "<", 10).toSql(),
			"SELECT `user`.`create_time` AS `createTime` FROM `test`.`user` AS `user` WHERE `user`.`id` < ?",
			[10],
		);
		checkSql(
			db
				.select("user")
				.addSelect("id")
				.where("lastLoginTime", Column("lastLoginTime"))
				.toSql(),
			"SELECT `user`.`id` AS `id` FROM `test`.`user` AS `user` WHERE `user`.`last_login_time` = `user`.`last_login_time`",
			[],
		);
		checkSql(
			db
				.select("user")
				.addSelect("createTime")
				.where("name", Or("user1", "user2"))
				.toSql(),
			"SELECT `user`.`create_time` AS `createTime` FROM `test`.`user` AS `user` WHERE (`user`.`name` = ? OR `user`.`name` = ?)",
			["user1", "user2"],
		);
		checkSql(
			db
				.select("user")
				.addSelect("createTime")
				.where(
					"name",
					Raw((f) => `${f} in (1,2,3)`),
				)
				.toSql(),
			"SELECT `user`.`create_time` AS `createTime` FROM `test`.`user` AS `user` WHERE `user`.`name` in (1,2,3)",
			[],
		);

		checkSql(
			db
				.select("user")
				.addSelect("createTime")
				.where(
					Raw((names) => ({
						sql: `LEFT(${names.name},2) = ?`,
						bindings: ["hi"],
					})),
				)
				.toSql(),
			"SELECT `user`.`create_time` AS `createTime` FROM `test`.`user` AS `user` WHERE LEFT(`user`.`name`,2) = ?",
			["hi"],
		);
		checkSql(
			db.select("user").addSelect("createTime").where({ id: 1 }).toSql(),
			"SELECT `user`.`create_time` AS `createTime` FROM `test`.`user` AS `user` WHERE `user`.`id` = ?",
			[1],
		);
		checkSql(
			db
				.select("user")
				.addSelect("createTime")
				.where({ id: Raw((name) => `${name} IS NOT NULL`) })
				.toSql(),
			"SELECT `user`.`create_time` AS `createTime` FROM `test`.`user` AS `user` WHERE `user`.`id` IS NOT NULL",
			[],
		);
		checkSql(
			db
				.select("user")
				.addSelect("createTime")
				.where(Or({ id: 1 }, { name: "system" }))
				.toSql(),
			"SELECT `user`.`create_time` AS `createTime` FROM `test`.`user` AS `user` WHERE (`user`.`id` = ? OR `user`.`name` = ?)",
			[1, "system"],
		);
		checkSql(
			db
				.select("user")
				.addSelect("createTime")
				.where(Or({ id: 1 }, { name: "system" }))
				.toSql(),
			"SELECT `user`.`create_time` AS `createTime` FROM `test`.`user` AS `user` WHERE (`user`.`id` = ? OR `user`.`name` = ?)",
			[1, "system"],
		);
	});
});
