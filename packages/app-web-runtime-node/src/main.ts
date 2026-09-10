import { createServer } from "http";
import { ServerConfig, ServerInstanceConfig } from "./type.js";
import { Readable } from "stream";
import { loadPackage } from "./load-package.js";
import { extname, join } from "path";
import { open, stat } from "fs/promises";
import { MIMEMap } from "./mime.js";

async function createHandle(instances: ServerInstanceConfig[]) {
	const list = await Promise.all(
		instances.map(async (i) => {
			switch (typeof i.package) {
				case "object":
					return {
						...i,
						package: i.package,
					};
				case "string":
					return {
						...i,
						package: await loadPackage(i.package),
					};
			}
		}),
	);
	return list.filter((i) => i);
}

export async function createHttpServer(config: ServerConfig) {
	const server = createServer();
	let handles = await createHandle(config.instances);
	server.on("request", async (req, res) => {
		const url = new URL(
			req.url || "/",
			`http://${req.headers.host || "127.0.0.1"}/`,
		);
		const instance = handles.find((i) => !i.if || i.if(url));
		if (instance) {
			if (req.method === "GET" && !url.pathname.includes("./")) {
				const path = join(instance.package.static, url.pathname);
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
				const ret = await instance.package.instances.onRequert(
					req.method?.toLocaleUpperCase() || "GET",
					url,
					req.headers,
					req,
					{ prefix: "/" },
				);
				if (ret) {
					if (ret.code) {
						res.statusCode = ret.code;
					}
					Object.entries(ret.header).forEach(([key, data]) => {
						res.setHeader(key, data as any);
					});
					if (ret.res) {
						if (ret.res instanceof ReadableStream) {
							Readable.fromWeb(ret.res as any).pipe(res);
						} else {
							ret.res.pipe(res);
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
		async updateinstances(ins: ServerInstanceConfig[]) {
			handles = await createHandle(ins);
		},
	};
}
