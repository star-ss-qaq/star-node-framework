import { UserConfig, Visitor } from "vite";
import { loadConfig } from "./loadConfig.js";
import { withTransform } from "@thestarweb/ts-helper";
import { transformer } from "@deepkit/type-compiler";
import { crreateSideOnlyVisitor } from "../ts-compiler/macro/index.js";
import {
	Node,
	SourceFile,
	TransformerFactory,
	visitEachChild,
} from "typescript";
import { SFModeConfig, SFPluging } from "../plugin/index.js";

let viteConfig: UserConfig | null = null;
export function getEnvironmentName(plugingName: string, modeName: string) {
	return `${plugingName}$${modeName}`.replaceAll(/[^a-z0-9A-Z\$]/gi, "_");
}
export async function loadViteConfig() {
	const config = await loadConfig();
	const environmentNameToConfig: Record<
		string,
		{ plugin: SFPluging; mode: string; config: SFModeConfig }
	> = {};
	const customEnvironment: UserConfig["environments"] = {};
	config.pluging.forEach(
		(i) =>
			i.mode &&
			Object.entries(i.mode).forEach(([mode, config]) => {
				const envName = getEnvironmentName(i.name, mode);
				environmentNameToConfig[envName] = { plugin: i, mode, config };
				customEnvironment[envName] = config.environments || {};
			}),
	);
	viteConfig = {
		environments: customEnvironment,
		plugins: [
			{
				name: "sf:main",
				load(id) {
					if (id === "sf:app-main") {
						const lines = [`import Main from ${JSON.stringify(config.entry)};`];
						if (config.useDi) {
							lines.push(
								"import { diCreate } from '@thestarweb/star-framework-di';",
							);
							lines.push("const main = await diCreate(Main);");
						} else {
							lines.push("const main = new Main();");
						}
						lines.push("export default main;");
						return lines.join("\n");
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
				transform(code: string, id: string, op) {
					if (!["js", "jsx", "ts", "tsx"].includes(op?.moduleType as any)) {
						return;
					}
					const side =
						environmentNameToConfig[this.environment.name]?.config.side || [];
					const factory: TransformerFactory<SourceFile>[] = [
						(context) => (node) => {
							const sideOnly = crreateSideOnlyVisitor(
								Array.isArray(side) ? side : [side],
							);
							const visitor = <T extends Node>(node: T): T => {
								return visitEachChild<T>(
									sideOnly<T>(node, context.factory, {}) as T,
									visitor,
									context,
								);
							};
							return visitor(node) as SourceFile;
						},
					];
					if (/\.tsx?($|\?)/.test(id)) {
						factory.push((context) => {
							const t = transformer(context);
							return (node) => t.transformSourceFile(node);
						});
					}
					const data = withTransform(code, factory, id);
					return data;
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
