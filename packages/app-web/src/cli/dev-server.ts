import {
	getEnvironmentName,
	type SFDevHook,
} from "@thestarweb/star-framework-cli";
import { addInterceptor, Interceptor } from "../interceptor/index.js";
import { middlewareToInterceptor } from "../interceptor/index.js";

import type { ViteDevServer } from "vite";
import {
	createHttpServer,
	RequestProp,
	ResolvedServerInstance,
	ResponseData,
	ServerInstance,
} from "@thestarweb/star-framework-web-runtime";
import { dumpRouteType } from "../server/dump-api-type.js";
import { join } from "path";

export function devServer(html: string): SFDevHook {
	let server: Awaited<ReturnType<typeof createHttpServer>>;
	let viteInterceptor: Interceptor;
	let _vite: ViteDevServer;
	const context = {
		root: process.cwd(),
		static: "",
		indexHtml: html,
	};
	let rawIns: ServerInstance | undefined;
	const ins: ResolvedServerInstance = {
		...context,
		name: "default",
		matchRequest: {},
		onRequest: function (prop: RequestProp): Promise<ResponseData> {
			if (rawIns) {
				return rawIns.onRequest(prop);
			}
			throw new Error("Function not implemented.");
		},
	};
	const devInterceptor: Interceptor = (req, next) => {
		return viteInterceptor(req, next);
	};
	function handleIns(obj: any) {
		addInterceptor(devInterceptor, obj._rawObject);
		const file = join(process.cwd(), "./route-type.ts");
		_vite?.watcher.unwatch(file);
		dumpRouteType(file, obj._rawObject);
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
			rawIns = handleIns(main(context));
			server = await createHttpServer({
				instances: [ins],
				port: 3000,
			});
		},
		async hotReload(main) {
			if (server) {
				rawIns = handleIns(main(context));
				console.log("hot updated");
			}
		},
	};
}
