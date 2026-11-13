import { Body, Get, Post, ResponseWithMeta } from "@thestarweb/star-framework-app-web";

export class BaseApi{
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
	@Get("/ttt")
	ttt() {
		return import("../index.css?raw");
	}
	@Post("/")
	post(@Body() body?: { a: boolean; b?: 1 | string }) {
		return body;
	}
}