import { UserConfig } from "vite";
import { loadConfig } from "./loadConfig.js";
import { withTransform } from "@thestarweb/ts-helper";
import { transformer } from "@deepkit/type-compiler";

let viteConfig: UserConfig | null = null;
export async function loadViteConfig() {
	const config = await loadConfig();
	viteConfig = {
		plugins: [
			{
				name: "sf:main",
				load(id) {
					if (id === "sf:app-main") {
						return [
							`import Main from ${JSON.stringify(config.entry)};`,
							"const main = new Main();",
							"export default main;",
						].join("\n");
					}
					if (id.startsWith("sf:app-main:")) {
						const [, , plugin, mode] = id.split(":");
						const pluginInfo = config.pluging.find((p) => p.name === plugin)
							?.mode?.[mode];
						if (pluginInfo) {
							return [
								`import main from "sf:app-main";`,
								`import {${pluginInfo.createApp.fnName} as createApp} from ${JSON.stringify(pluginInfo.createApp.import)};`,
								"export default createApp(main);",
							].join("\n");
						}
					}
				},
				resolveId(id) {
					if (id === "sf:app-main" || id.startsWith("sf:app-main:")) {
						return id;
					}
				},
			},
			{
				name: "ts",
				enforce: "pre",
				transform(code: string, id: string) {
					if (id.endsWith("ts")) {
						const data = withTransform(
							code,
							[
								(context) => {
									const t = transformer(context);
									return (node) => t.transformSourceFile(node);
								},
							],
							id,
						);
						return data;
					}
				},
			},
		],
		resolve: {
			alias: {},
		},
	};
	if (process.env.SF_DEV) {
		const { getProjectAliasObj } =
			// @ts-ignore
			await import("../../../../tools/all-package.js");
		viteConfig.resolve!.alias = getProjectAliasObj();
	}
	return viteConfig;
}

export function getViteConfig() {
	return viteConfig;
}
