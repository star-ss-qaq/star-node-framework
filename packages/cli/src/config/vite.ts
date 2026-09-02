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
							"export default new Main();",
						].join("\n");
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
