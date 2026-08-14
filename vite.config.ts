import { defineConfig } from "vitest/config";
import { deepkitType } from "@deepkit/vite";
import { readdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { transformFile } from "./helper.js";

const projects: { name: string; version: string; location: string }[] =
	JSON.parse(
		execSync("npx lerna list --long --all --json", {
			encoding: "utf-8",
			stdio: "pipe",
		}),
	);

export default defineConfig({
	plugins: [
		//deepkitType({ compilerOptions: { sourceMap: true } })
		{
			name: "deepkit-type",
			enforce: "pre",
			transform: transformFile,
		},
	],
	test: {
		globals: true,
		environment: "node",
	},
	resolve: {
		alias: Object.fromEntries(
			projects.map((i) => [i.name, join(i.location, "src/index.ts")]),
		),
	},
});
