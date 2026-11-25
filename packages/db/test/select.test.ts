import { expect, describe, test } from "vitest";
import { SFDB, Value } from "../src/index.js";
import { baseSchema } from "./base/schema.js";
import { checkSql } from "./base/utils.js";
import { TestOnlyDrive } from "../src/drive/test-only.js";

describe("测试SELECT语句拼接", () => {
	const db = new SFDB(baseSchema, { type: "test-only" });
	test("最基础的查询", async () => {
		checkSql(
			db.select("user").addSelect("createTime").toSql(),
			"SELECT `user`.`create_time` AS `createTime` FROM `test`.`user` AS `user`",
			[],
		);
		checkSql(
			db.select("user").addSelect("createTime as alias").toSql(),
			"SELECT `user`.`create_time` AS `alias` FROM `test`.`user` AS `user`",
			[],
		);
		let createTime = 100;
		TestOnlyDrive.setNextRes([{ createTime }]);
		expect(await db.select("user").addSelect("createTime")).toEqual([
			{ createTime: new Date(createTime * 1000) },
		]);
	});

	test("where条件", async () => {
		checkSql(
			db.select("user").addSelect("createTime").where("name", "hello").toSql(),
			"SELECT `user`.`create_time` AS `createTime` FROM `test`.`user` AS `user` WHERE `user`.`name` = ?",
			["hello"],
		);
	});
	test("联合表查询", async () => {
		checkSql(
			db
				.select("user")
				.addSelect("createTime")
				.join("userData")
				.on("user.id", "userData.uid")
				.toSql(),
			"SELECT `user`.`create_time` AS `createTime` " +
				"FROM `test`.`user` AS `user` JOIN `test`.`user_data` AS `userData` ON `user`.`id` = `userData`.`uid`",
			[],
		);
		checkSql(
			db
				.select("user")
				.addSelect("createTime")
				.join("userData")
				.on("user.id", "userData.uid")
				.on("data", Value(""))
				.toSql(),
			"SELECT `user`.`create_time` AS `createTime` " +
				"FROM `test`.`user` AS `user` JOIN `test`.`user_data` AS `userData` ON `user`.`id` = `userData`.`uid` AND `userData`.`data` = ?",
			[""],
		);
	});
	test("子查询", async () => {
		checkSql(
			db
				.select("user")
				.addSelect("createTime")
				.join(
					db
						.select("userData")
						.addSelect("uid")
						.where("data", "")
						.asSubQuery("a"),
				)
				.on("a.uid", "user.id")
				.toSql(),
			"SELECT `user`.`create_time` AS `createTime` FROM `test`.`user` AS `user` JOIN (" +
				"SELECT `userData`.`uid` AS `uid` FROM `test`.`user_data` AS `userData` WHERE `userData`.`data` = ?" +
				") as a ON `a`.`uid` = `user`.`id`",
			[""],
		);
	});
});
