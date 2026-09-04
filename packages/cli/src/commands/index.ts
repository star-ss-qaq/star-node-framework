import { buildApp, Command, Options } from "@thestarweb/star-framework-app-cli";
import {
	createServer,
	isRunnableDevEnvironment,
	mergeConfig,
	RunnableDevEnvironment,
} from "vite";
import { getConfig, loadConfig } from "../config/loadConfig.js";
import { loadViteConfig } from "../config/vite.js";
import { SFPluging } from "../plugin/index.js";
import { callWithHook } from "./call-with-hook.js";
import { TypeInfo } from "./type.js";

class SFCli {
	private _allTypes?: Map<string, SFPluging[]>;
	parseType(type?: string, only = true) {
		const ret: TypeInfo[] = [];
		const sfConfig = getConfig()!;
		const [pluging, typeName] = type
			? type.includes(":")
				? type.split(":", 2)
				: [undefined, type]
			: [undefined, undefined];
		sfConfig.pluging.forEach((p) => {
			if (p.mode && (!pluging || pluging === p.name)) {
				if (typeName) {
					if (p.mode[typeName]) {
						ret.push({
							plugin: p,
							type: typeName,
						});
					}
				} else {
					const keys = Object.keys(p.mode);
					keys.forEach((k) => {
						ret.push({
							plugin: p,
							type: k,
						});
					});
				}
			}
		});
		if (ret.length === 0) {
			console.error("当前没有任何插件提供应用类型，cli无法进行任何操作");
			process.exit();
		}
		if (only && ret.length > 1) {
			console.error(
				`当前有多个满足条件的应用类型，但是当前操作仅支持操作单个应用：${ret.map((i) => `${i.plugin.name}:${i.type}`)}`,
			);
			process.exit();
		}
		return ret;
	}
	@Command("dev")
	async dev(
		@Options()
		type?: string,
	) {
		const [pType] = this.parseType(type);
		const typeConfig = pType.plugin.mode![pType.type];
		const hook =
			typeof typeConfig.dev === "function"
				? typeConfig.dev()
				: typeConfig.dev || {};
		let timeout: NodeJS.Timeout;
		let hasMessageNoHot = false;
		let isStarted = false;
		const viteConfig = mergeConfig(await loadViteConfig(), {
			appType: "custom",
			server: { middlewareMode: true },
			environments: { [pType.type]: {} },
			plugins: [
				{
					name: "sf:hot",
					hotUpdate() {
						if (hook.hotReload || !isStarted) {
							clearTimeout(timeout);
							timeout = setTimeout(async () => {
								await loadMainMoudle();
							}, 100);
						} else if (!hasMessageNoHot) {
							hasMessageNoHot = true;
							console.warn("当前APP不支持热更新");
						}
					},
				},
			],
		});
		const viteServer = await callWithHook(
			createServer,
			hook.createViteServer,
			viteConfig,
		);
		hook.onViteServerInited?.(viteServer);
		const env = viteServer.environments[pType.type];
		if (!isRunnableDevEnvironment(env)) {
			throw new Error("Environment配置异常");
		}
		async function loadMainMoudle() {
			let app: any = null;
			try {
				app = await callWithHook(
					(env) =>
						env.runner
							.import(`sf:app-main:${pType.plugin.name}:${pType.type}`)
							.then((m) => m.default),
					hook.loadMainModule,
					env as RunnableDevEnvironment,
				);
			} catch (e) {
				console.error(e);
				return;
			}
			if (isStarted) {
				hook.hotReload?.(app);
			} else {
				isStarted = true;
				callWithHook(async (mainModule) => {}, hook.start, app);
			}
		}
		loadMainMoudle();
	}
}
export default async function main() {
	await loadConfig();
	buildApp(new SFCli())(process.argv);
}
