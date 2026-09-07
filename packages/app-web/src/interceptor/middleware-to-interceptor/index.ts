import { ViteDevServer } from "vite";
import { Interceptor } from "../types.js";
// @side-only server
import { IncomingMessage } from "node:http";
// @side-only server
import { MookReq } from "./mook-req.js";
// @side-only server
import { MookRes } from "./mock-res.js";

export function middlewareToInterceptor(
	middleware: ViteDevServer["middlewares"],
): Interceptor {
	return (req, next) => {
		return new Promise((resolve, reject) => {
			try {
				const _req = new MookReq(req);
				middleware(_req as any, new MookRes(_req, resolve) as any, async () => {
					try {
						resolve(await next(req));
					} catch (e) {
						reject(e);
					}
				});
			} catch (e) {
				reject(e);
			}
		});
	};
}
