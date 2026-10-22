import { Body, Get, Post } from "@thestarweb/star-framework-app-web";
import { db } from "../database/index.js";
import { Param } from "@thestarweb/star-framework-app-web";

export class DBRouter {
	@Get("api-user/:id")
	user(@Param("id") id: string) {
		return db.select("user").addSelect("*").where("id", id).limit(1).one();
	}
	@Post("api-user")
	async addUser(@Body("name") name: string) {
		await db.insert("user").data({ name });
	}
}
