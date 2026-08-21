import { createServer } from "http";
import { ServerConfig } from "./type.js";
import { createServerInstance } from "./server/index.js";

async function createHandle(config: ServerConfig) {
	return config.instances.map((i) => {
		const instance = createServerInstance(i.main);
		return {
			...i,
			instance,
		};
	});
}

export async function createHttpServer(config: ServerConfig) {
	const server = createServer();
	const handles = await createHandle(config);
	server.on("request", async (req, res) => {
		const url = new URL(
			req.url || "/",
			`http://${req.headers.host || "127.0.0.1"}/`,
		);
		const instance = handles.find((i) => !i.if || i.if(url));
		if (instance) {
			try {
				const ret = await instance.instance.onRequert(
					req.method || "get",
					url,
					req.headers,
					req,
				);
				if (ret) {
					Object.entries(ret.header).forEach(([key, data]) => {
						res.setHeader(key, data as any);
					});
					if (ret.res) {
						ret.res.pipe(res);
					} else {
						res.end();
					}
					return;
				}
			} catch (e) {
				console.warn(e);
				res.statusCode = 500;
				return;
			}
		}
		res.statusCode = 404;
		res.end();
	});
	server.listen(config.port);
	console.log(`server start at: http://127.0.0.1:${config.port}`);
}
