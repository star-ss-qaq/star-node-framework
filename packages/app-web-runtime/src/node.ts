import { createServer } from "http";
import { ServerConfig, ServerInstanceConfig } from "./types/index.js";
import { Readable } from "stream";
import { extname, join } from "path";
import { open, stat } from "fs/promises";
import { MIMEMap } from "./mime.js";
import { parseInstancesConfig } from "./parse-instances-config.js";

export async function createHttpServer(config: ServerConfig) {
	const server = createServer();
	let handles = await parseInstancesConfig(config.instances);
	server.on("request", async (req, res) => {
		const url = new URL(
			req.url || "/",
			`http://${req.headers.host || "127.0.0.1"}/`,
		);
		let prefix = '/'
		const instance = handles.find((i) => {
			if(i.matchRequest.host&&!i.matchRequest.host.test(url.host)) return false;
			if(i.matchRequest.prefix){
				const p = i.matchRequest.prefix.exec(url.pathname)
				if(!p)return false;
				prefix = p[0];
			} else{
				prefix = '/'
			}
			return true;
		});
		if (instance) {
			if (
				req.method === "GET" &&
				!url.pathname.includes("./") &&
				instance.staticFilePath
			) {
				const path = join(instance.staticFilePath, url.pathname);
				try {
					const s = await stat(path);
					if (s.isFile()) {
						res.setHeader(
							"content-type",
							MIMEMap[extname(path).substring(1)] || "application/octet-stream",
						);
						const handle = await open(path, "r");
						const stream = handle.createReadStream();
						stream.pipe(res);
						stream.on("end", () => handle.close());
						return;
					}
				} catch {}
			}
			try {
				const ret = await instance.onRequest({
					method: (req.method?.toUpperCase() as any) || "GET",
					url,
					header: req.headers,
					body: Readable.toWeb(req) as any,
					context: { prefix: "/" },
				});
				if (ret) {
					if (ret.code) {
						res.statusCode = ret.code;
					}
					Object.entries(ret.header).forEach(([key, data]) => {
						res.setHeader(key, data as any);
					});
					if (ret.res) {
						if(ret.res instanceof Readable){
							ret.res.pipe(res);
						}else{
							Readable.fromWeb(ret.res as any).pipe(res);
						}
					} else {
						res.end();
					}
					return;
				}
			} catch (e) {
				console.warn(e);
				res.statusCode = 500;
				res.end();
				return;
			}
		}
		res.statusCode = 404;
		res.end();
	});
	server.listen(config.port);
	console.log(`server start at: http://127.0.0.1:${config.port}`);
	return {
		async updateInstances(config: ServerConfig) {
			handles = await parseInstancesConfig(config.instances);
		},
	};
}
