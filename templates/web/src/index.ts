import "./index.css";
import {
	AddInterceptor,
	Body,
	Get,
	HTMLRender,
	Layout,
	Post,
	SubRoute,
	View,
} from "@thestarweb/star-framework-app-web";
import { ResponseWithMeta } from "@thestarweb/star-framework-app-web";
import { Inject } from "@thestarweb/star-framework-di";
import { VueRoute } from "./vue/index.js";
@Layout(
	new HTMLRender(
		`<div>this is Layout of ViewRoute
		<a href='/view'>view</a>
		<a href='/vue'>vue</a>
		<a href='/vue/about/'>about</a>
		<a href='/vue/html1'>html1</a>
		<a href='/vue/html2'>html2</a>
		<a href='/' target="_balnk">11</a>
		<sf-route />
		</div>`,
	),
	(meta) => ({
		...meta,
		title: `${meta.title} - star-framework-demo`,
		htmlMeta: {
			...meta.htmlMeta,
			author: "star_ss",
		},
	}),
)
class ViewRoute {
	@View("", new HTMLRender("<div>this is a html for root</div>"), {
		title: "index",
	})
	index: undefined;

	@View("/view", new HTMLRender("<div>this is a html for view</div>"), {
		title: "view",
	})
	view() {}
	@Inject()
	@SubRoute("vue")
	vue!: VueRoute;
}

@AddInterceptor((req, next) => {
	console.log("req:", req.url.href, req.body);
	return next(req);
})
export default class App {
	@Get("/test")
	hello() {
		return "server is running";
	}
	@Get("/with-meta")
	meta() {
		return new ResponseWithMeta("with meta", {
			code: 401,
			header: { "set-header": "sf-header" },
		});
	}
	@Get("stream")
	stream() {
		const { readable, writable } = new TransformStream();
		const writer = writable.getWriter();
		writer.write(" ".repeat(1024));
		let i = 0;
		const u = setInterval(() => {
			writer.write(`\n123456\n`);
			if (i++ > 20) {
				clearInterval(u);
				writer.close();
			}
		}, 1000);
		return readable;
	}
	@Inject()
	@SubRoute("/")
	view!: ViewRoute;
	@Get("/ttt")
	ttt() {
		return import("./index.css?raw");
	}
	@Post("/")
	post(@Body() body?: { a: boolean; b?: 1 | string }) {
		return body;
	}
}
