process.env.NODE_ENV = "";
import { defineConfig } from "vitest/config";
import { getProjectAliasObj } from "./tools/all-package.js";
import { withTransform } from "./packages/ts-helper/src/transform-helper.js";
import { transformer } from "@deepkit/type-compiler";
import {
	// @ts-ignore
	Debug,
} from "typescript";

export default defineConfig({
	plugins: [
		// deepkitType({ compilerOptions: { sourceMap: true } }),
		// {
		// 	name: "deepkit-type",
		// 	enforce: "pre",
		// 	transform: transformFile,
		// },
		{
			name: "ts",
			enforce: "pre",
			transform(code: string, id: string) {
				Debug.setAssertionLevel(0); // 临时修复deepkit会在一些重载方法上报错，暂时不知道具体原因
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
	test: {
		globals: true,
		environment: "node",
	},
	resolve: {
		// alias: Object.fromEntries(
		// 	projects.map((i) => [i.name, join(i.location, "src/index.ts")]),
		// ),
		alias: getProjectAliasObj(),
	},
});
