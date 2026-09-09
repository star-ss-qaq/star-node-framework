import { buildApp, Command, Options } from "@thestarweb/star-framework-app-cli";
import {
	build,
	createBuilder,
	createServer,
	isRunnableDevEnvironment,
	mergeConfig,
	RunnableDevEnvironment,
} from "vite";
import {
	getConfig,
	loadConfig,
	getEnvironmentName,
	loadViteConfig,
} from "../config/index.js";
import { BuildRes, SFPluging } from "../plugin/index.js";
import { callWithHook } from "./call-with-hook.js";
import { TypeInfo } from "./type.js";
import { RolldownOutput } from "rolldown";

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
		const env =
			viteServer.environments[
				getEnvironmentName(pType.plugin.name, pType.type)
			] || viteServer.environments.ssr;
		if (!isRunnableDevEnvironment(env)) {
			throw new Error("Environment配置异常");
		}
		async function loadMainMoudle() {
			let app: any = null;
			try {
				app = await callWithHook(
					(env) => env.runner.import(`sf:main`).then((m) => m.default),
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
	@Command("build")
	async build(
		@Options()
		type?: string,
	) {
		const viteConfig = await loadViteConfig();
		const builder = await createBuilder(viteConfig);
		const types = this.parseType(type, false);
		const tRes: Record<string, Record<string, BuildRes>> = Object.create(null);
		const plugins = new Set<SFPluging>();
		for (let item of types) {
			const e =
				builder.environments[getEnvironmentName(item.plugin.name, item.type)];
			if (e) {
				const res = (await builder.build(e)) as RolldownOutput;
				const buildRes: BuildRes = {
					main: [],
					assets: [],
				};
				res.output.forEach((o) => {
					if ((o as any).isEntry) {
						buildRes.main.push(o.fileName);
					} else {
						buildRes.assets.push(o.fileName);
					}
				});
				await item.plugin.onAnyModeBuild?.(item.type, buildRes);
				if (!tRes[item.plugin.name]) {
					tRes[item.plugin.name] = {};
				}
				tRes[item.plugin.name][item.type] = buildRes;
				plugins.add(item.plugin);
			}
		}
		for (let p of plugins) {
			await p.onAllModeBuildEnd?.(Object.keys(tRes[p.name]), tRes[p.name]);
		}
	}
}
export default async function main() {
	await loadConfig();
	buildApp(new SFCli())(process.argv);
}
