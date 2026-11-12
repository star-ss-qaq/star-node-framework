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
	ServerConfig,
} from "@thestarweb/star-framework-web-runtime-node";
import { dumpRouteType } from "../server/dump-api-type.js";
import { isAbsolute, join } from "path";

export interface DevServerConfig extends Partial<ServerConfig> {
	/**
	 * 输出API类型定义的默认位置
	 * 以便项目内能获得Request中具体API的类型提示
	 * @default ./route-type.ts
	 */
	apiTypeDefinePath?: false | string;

	/**
	 * 输出带有命名空间的API类型定义文件位置，如果项目需要供其他项目使用，则需要设置，以便将类型定义分发给其他程序使用
	 */
	apiTypeNamespaceDefinePath?: false | string;
	/**
	 * @default 3000
	 */
	port: number;
}

export function devServer(
	html: string,
	{
		apiTypeDefinePath = "./route-type.ts",
		apiTypeNamespaceDefinePath,
		port = 3000,
		instances = [],
		...serverConfig
	}: DevServerConfig,
): SFDevHook {
	let server: Awaited<ReturnType<typeof createHttpServer>>;
	let viteInterceptor: Interceptor;
	let _vite: ViteDevServer;
	let packageName = "";
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
		if (apiTypeDefinePath) {
			const file = isAbsolute(apiTypeDefinePath)
				? apiTypeDefinePath
				: join(process.cwd(), apiTypeDefinePath);
			_vite?.watcher.unwatch(file);
			dumpRouteType(file, obj._rawObject);
		}
		if (apiTypeNamespaceDefinePath) {
			const file = isAbsolute(apiTypeNamespaceDefinePath)
				? apiTypeNamespaceDefinePath
				: join(process.cwd(), apiTypeNamespaceDefinePath);
			_vite?.watcher.unwatch(file);
			dumpRouteType(file, obj._rawObject, packageName);
		}
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
			const { info } = await import("./package-info.js");
			packageName = info.name;
			ins.instances = handleIns(main(context));
			server = await createHttpServer({
				...serverConfig,
				instances: [
					...instances,
					{
						package: ins,
					},
				],
				port,
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
