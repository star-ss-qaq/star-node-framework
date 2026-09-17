import {
	getEnvironmentName,
	type SFDevHook,
} from "@thestarweb/star-framework-cli";
import { addInterceptor, Interceptor } from "../interceptor/index.js";
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
		return viteInterceptor(req, next);
	};
	function handleIns(obj: any) {
		addInterceptor(devInterceptor, obj._rawObject);
		return obj;
	}
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
			ins.instances = handleIns(main(context));
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
				ins.instances = handleIns(main(context));
				console.log("hot updated");
			}
		},
	};
}
