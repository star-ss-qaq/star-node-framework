import { expect, describe, test } from "vitest";
import { SFDB } from "../src/index.js";
import { baseSchema } from "./base/schema.js";
import { checkSql } from "./base/utils.js";

describe("测试INSERT语句拼接", () => {
	const db = new SFDB(baseSchema, { type: "test-only" });
	test("最基础的插入", async () => {
		const now = new Date();
		checkSql(
			db
				.insert("user")
				.data({
					createTime: now,
					name: "",
					id: 1,
				})
				.toSql(),
			"INSERT INTO `test`.`user`(`id`, `name`, `create_time`, `last_login_time`) VALUES(?, ?, ?, ?)",
			[1, "", Math.floor(now.valueOf() / 1000), 0],
		);
	});
	test("插入多条数据", async () => {
		const now = new Date();
		const nowInt = Math.floor(now.valueOf() / 1000);
		checkSql(
			db
				.insert("user")
				.data(
					{
						createTime: now,
						name: "user1",
						id: 1,
					},
					{
						createTime: now,
						name: "user2",
						id: 2,
					},
				)
				.toSql(),
			"INSERT INTO `test`.`user`(`id`, `name`, `create_time`, `last_login_time`) VALUES(?, ?, ?, ?), (?, ?, ?, ?)",
			[1, "user1", nowInt, 0, 2, "user2", nowInt, 0],
		);
	});
	test("从其他SQL插入", async () => {
		// TODO这种SQL几乎没用过 是否正确还需要验证
		checkSql(
			db
				.insert("user")
				.dataFromQuery(db.select("user").addSelect("*").where("name", "test"))
				.toSql(),
			"INSERT INTO `test`.`user`(`id`, `name`, `create_time`, `last_login_time`) (" +
				"SELECT `id`, `name`, `createTime`, `lastLoginTime` FROM (" +
				"SELECT `user`.`id` AS `id`, `user`.`name` AS `name`, `user`.`create_time` AS `createTime`, `user`.`last_login_time` AS `lastLoginTime` FROM `test`.`user` AS `user` WHERE `user`.`name` = ?" +
				") AS `t0`" +
				")",
			["test"],
		);
	});
});
