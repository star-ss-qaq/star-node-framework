import { createServer } from "http";
import { ServerConfig, ServerInstanceConfig } from "./type.js";
import { createServerInstance, ServerInstance } from "./server/index.js";

async function createHandle(instances: ServerInstanceConfig[]) {
	return await Promise.all(
		instances.map(async (i) => {
			const ret = {
				...i,
				instance: undefined as unknown as ServerInstance,
			};
			const { main } = i;
			switch (typeof main) {
				case "object":
					ret.instance = createServerInstance(main);
					break;
				case "function":
					ret.instance = createServerInstance(await main());
					if (typeof (i as any)._hot === "function") {
						(i as any)._hot(async () => {
							ret.instance = createServerInstance(await main());
							console.log("module hot updated");
						});
					}
					break;
			}
			return ret;
		}),
	);
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
			try {
				const ret = await instance.instance.onRequert(
					req.method || "get",
					url,
					req.headers,
					req,
				);
				if (ret) {
					if (ret.code) {
						res.statusCode = ret.code;
					}
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
