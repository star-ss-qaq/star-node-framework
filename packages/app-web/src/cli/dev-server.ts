import {
	getEnvironmentName,
	type SFDevHook,
} from "@thestarweb/star-framework-cli";
import { Interceptor } from "../interceptor/index.js";
import { middlewareToInterceptor } from "../interceptor/index.js";

import type { ViteDevServer } from "vite";
import {
	createHttpServer,
	ParsedPackage,
} from "@thestarweb/star-framework-web-runtime-node";

export function devServer(html: string): SFDevHook {
	let server: Awaited<ReturnType<typeof createHttpServer>>;
	let viteInterceptor: Interceptor;
	let _vite: ViteDevServer;
	const context = {
		root: process.cwd(),
		static: "",
		indexHtml: html,
	};
	const ins: ParsedPackage = {
		...context,
		instances: undefined as any,
	};
	const devInterceptor: Interceptor = (req, next) => {
		// if (req.url.pathname === "/main.js") {
		// 	return new ResponseWithMeta(mainContent, {
		// 		header: { "content-type": "text/javascript" },
		// 	});
		// }
		return viteInterceptor(req, next);
	};
	return {
		async onViteServerInited(vite) {
			viteInterceptor = middlewareToInterceptor(vite.middlewares);
			// TODO 暂时像用这种“硬核”方式让middlewares使用特定环境
			vite.environments.client =
				vite.environments[getEnvironmentName("sf-web", "browser")];
			_vite = vite;
			context.indexHtml = await vite.transformIndexHtml("index.html", html);
		},
		async start(main) {
			ins.instances = main(context);
			(ins.instances as any)._addGlobalInterceptor(devInterceptor);
			server = await createHttpServer({
				instances: [
					{
						package: ins,
					},
				],
				port: 3000,
			});
		},
		async hotReload(main) {
			if (server) {
				ins.instances = main(context);
				(ins.instances as any)._addGlobalInterceptor(devInterceptor);
				console.log("hot updated");
			}
		},
	};
}
