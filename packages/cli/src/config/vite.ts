import { UserConfig, Visitor } from "vite";
import { loadConfig } from "./loadConfig.js";
import {
	createTransformerFactoryByTsVistor,
	withTransform,
} from "@thestarweb/ts-helper";
import { transformer } from "@deepkit/type-compiler";
import {
	crreateSideOnlyVisitor,
	SiteOnlyConfigRule,
} from "../ts-compiler/macro/index.js";
import { SourceFile, TransformerFactory } from "typescript";
import { SFModeConfig, SFPluging } from "../plugin/index.js";
import { join } from "path";

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
	const customEnvironment: any = {};
	const siteOnlyConfig: SiteOnlyConfigRule[] = [];
	config.pluging.forEach((i) => {
		i.mode &&
			Object.entries(i.mode).forEach(([mode, config]) => {
				const envName = getEnvironmentName(i.name, mode);
				environmentNameToConfig[envName] = { plugin: i, mode, config };
				customEnvironment[envName] = {
					input: "sf:main",
					...config.environments,
					build: {
						outDir: join("dist", i.name, mode),
						...config.environments?.build,
					},
				};
			});
		if (i.siteOnlyConfig) {
			siteOnlyConfig.push(...i.siteOnlyConfig);
		}
	});
	function getModeMainCode(mode: SFModeConfig) {
		return [
			`import main from "sf:app-main";`,
			`import {${mode.createApp.fnName} as createApp} from ${JSON.stringify(mode.createApp.import)};`,
			"export default createApp(main);",
		].join("\n");
	}
	viteConfig = {
		environments: customEnvironment,
		// @ts-ignore
		input: "sf:main",
		build: {
			minify: false,
		},
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
						return { code: lines.join("\n"), moduleType: "ts" };
					}
					if (id === "sf:main") {
						const config =
							environmentNameToConfig[this.environment.name]?.config;
						if (config) {
							return { code: getModeMainCode(config), moduleType: "ts" };
						}
					}
				},
				resolveId(id) {
					if (id === "sf:app-main" || id === "sf:main") {
						return id;
					}
				},
			},
			{
				name: "ts",
				enforce: "pre",

				transform: {
					filter: { id: /(j|t|m)sx?$/ },
					handler(code: string, id: string, op) {
						if (!["js", "jsx", "ts", "tsx"].includes(op?.moduleType as any)) {
							return;
						}
						// if (!/(j|t|m)sx?$/.test(id)) return;
						const side =
							environmentNameToConfig[this.environment.name]?.config.side || [];
						const factory: TransformerFactory<SourceFile>[] = [
							createTransformerFactoryByTsVistor(
								crreateSideOnlyVisitor(Array.isArray(side) ? side : [side], {
									rules: siteOnlyConfig,
								}),
							),
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
			},
			...config.pluging.flatMap((i) => i.vitePlugin).filter(Boolean),
		],
		resolve: {
			alias: {},
		},
	} as UserConfig;
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
