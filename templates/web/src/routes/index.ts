import { SubRoute } from "@thestarweb/star-framework-app-web";
import { DBRouter } from "./db.js";
import { Inject } from "@thestarweb/star-framework-di";
import { ReactRoute } from "./react.js";

export class Route {
	@Inject()
	@SubRoute("/db")
	dbRoute!: DBRouter;
	@Inject()
	@SubRoute('react')
	react!: ReactRoute;
}
