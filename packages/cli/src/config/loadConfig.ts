import { join } from "path";
import { SFConfig } from "./types.js";
import { pathToFileURL } from "url";
import { access } from "fs/promises";

let loadedConfig: Required<SFConfig> | null = null;
export async function loadConfig() {
	if (!loadedConfig) {
		let userConfig: SFConfig = {};
		for (const name of ["sf.config.js"]) {
			const file = join(process.cwd(), name);
			try {
				access(file);
			} catch {
				continue;
			}
			({ default: userConfig } = await import(pathToFileURL(file).toString()));
		}
		loadedConfig = {
			entry: join(process.cwd(), userConfig.entry || "src/index.ts"),
			pluging: userConfig.pluging || [],
		};
		Object.freeze(loadedConfig);
	}
	return loadedConfig;
}
export function getConfig() {
	return loadedConfig;
}
