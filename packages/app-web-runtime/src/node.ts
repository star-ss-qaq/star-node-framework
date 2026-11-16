import { createServer } from "http";
import { ServerConfig } from "./types/index.js";
import { Readable } from "stream";
import { parseInstancesConfig } from "./parse-instances-config.js";

export async function createHttpServer(config: ServerConfig) {
	const server = createServer();
	let handle = await parseInstancesConfig(config.instances);
	server.on("request", async (req, res) => {
		const controller = new AbortController();
		const { signal } = controller;
		res.on("close", () => {
			controller.abort();
		});
		const url = new URL(
			req.url || "/",
			`http://${req.headers.host || "127.0.0.1"}/`,
		);
		const ret = await handle({
			method: (req.method?.toUpperCase() as any) || "GET",
			url,
			header: req.headers,
			body: Readable.toWeb(req) as any,
			context: { prefix: "/" },
			signal,
		});
		if (signal.aborted) return;
		if (ret.code) {
			res.statusCode = ret.code;
		}
		Object.entries(ret.header).forEach(([key, data]) => {
			res.setHeader(key, data as any);
		});
		if (ret.data) {
			if (ret.data instanceof Readable) {
				ret.data.pipe(res);
			} else {
				Readable.fromWeb(ret.data as any).pipe(res);
			}
		} else {
			res.end();
		}
	});
	server.listen(config.port);
	console.log(`server start at: http://127.0.0.1:${config.port}`);
	return {}
}
