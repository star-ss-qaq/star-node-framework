import { type SFDevHook } from "@thestarweb/star-framework-cli";
import { createHttpServer } from "../runtime/index.js";
import { AddInterceptor, Interceptor } from "../interceptor/index.js";
import { middlewareToInterceptor } from "../interceptor/index.js";

import type { ViteDevServer } from "vite";
import { ResponseWithMeta } from "../return-types/response-with-meta.js";

export function devServer(): SFDevHook {
	let server: Awaited<ReturnType<typeof createHttpServer>>;
	let viteInterceptor: Interceptor;
	let _vite: ViteDevServer;
	const interceptor: Interceptor = (req, next) => {
		if (_vite) {
			return middlewareToInterceptor(_vite.middlewares)(req, async () => {
				const data = await next(req);
				const cType = data.header?.["content-type"];
				const stringCType = Array.isArray(cType) ? cType.join(";") : cType;
				if (
					typeof data.data === "string" &&
					stringCType?.startsWith("text/html")
				) {
					return new ResponseWithMeta(
						await _vite.transformIndexHtml(req.url.href, data.data),
						data,
					);
				}
				return data;
			});
		}
		return next(req);
	};
	return {
		onViteServerInited(vite) {
			viteInterceptor = middlewareToInterceptor(vite.middlewares);
			vite.transformIndexHtml;
			_vite = vite;
		},
		async start(main) {
			main.addGlobalInterceptor(interceptor);
			server = await createHttpServer({
				instances: [{ main }],
				port: 3000,
			});
		},
		async hotReload(main) {
			main.addGlobalInterceptor(interceptor);
			if (server) {
				await server.updateinstances([{ main }]);
				console.log("hot updated");
			}
		},
	};
}
