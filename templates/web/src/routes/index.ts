import { SubRoute } from "@thestarweb/star-framework-app-web";
import { DBRouter } from "./db.js";
import { Inject } from "@thestarweb/star-framework-di";
import { ViewRoute } from "./view/index.js";
import { BaseApi } from "./base-api.js";

export class Route {
	@Inject()
	@SubRoute("/")
	baseApi!: BaseApi;
	@Inject()
	@SubRoute("/")
	view!: ViewRoute;
	@Inject()
	@SubRoute("/db")
	dbRoute!: DBRouter;
}
