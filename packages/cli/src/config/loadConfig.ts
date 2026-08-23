import { join } from "path";
import { SFConfig } from "./types.js";
import { pathToFileURL } from "url";

let loadedConfig: Required<SFConfig> | null = null;
export async function loadConfig() {
	if (!loadedConfig) {
		let userConfig: SFConfig = {};
		try {
			({ default: userConfig } = await import(
				pathToFileURL(join(process.cwd(), "sf.config.js")).toString()
			));
		} catch (e) {
			// console.log(111, process.cwd(), e);
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
