import "./index.css";
import {
	AddInterceptor,
	SubRoute,
} from "@thestarweb/star-framework-app-web";
import { Inject } from "@thestarweb/star-framework-di";
import { Route } from "./routes/index.js";


@AddInterceptor((req, next) => {
	console.log("req:", req.url.href, req.body);
	return next(req);
})
export default class App {
	@Inject()
	@SubRoute("/")
	route!: Route;
}
