import { SFConfig } from "./types.js";

export * from "./types.js";
export * from "./loadConfig.js";
export * from "./vite.js";

export function defineConfig(config: SFConfig) {
	return config;
}
