import { DeepPartial } from "@thestarweb/ts-helper";
import {
	EnvironmentOptions,
	InlineConfig,
	Plugin,
	ResolvedConfig,
	type RunnableDevEnvironment,
	ViteDevServer,
} from "vite";
import type { SiteOnlyConfigRule } from "../ts-compiler/index.js";

export interface SFDevHook {
	createViteServer?(
		config: InlineConfig,
	): ViteDevServer | Promise<ViteDevServer>;
	onViteServerInited?(vite: ViteDevServer): Promise<void> | void;
	onViteEnvironmentLoaded?(env: RunnableDevEnvironment): Promise<void> | void;
	loadMainModule?(env: RunnableDevEnvironment): Promise<{ default: object }>;
	start?(main: any): void;
	hotReload?(main: any): void;
}
export interface SFModeConfig {
	createApp: {
		import: string;
		fnName: string;
	};
	dev?: SFDevHook | (() => SFDevHook);
	environments?: DeepPartial<
		EnvironmentOptions & ResolvedConfig["environments"][string]
	>;
	side?: StarFrameworkSide | StarFrameworkSide[];
}
export interface BuildRes {
	main: string[];
	assets: string[];
	distPath: string;
}
export interface SFPluging {
	name: string;
	mode?: Record<string, SFModeConfig>;
	vitePlugin?: Plugin | Plugin[];
	onAnyModeBuild?: (mode: string, buildRes: BuildRes) => any;
	onAllModeBuildEnd?: (modes: string[], res: Record<string, BuildRes>) => any;
	siteOnlyConfig?: SiteOnlyConfigRule[];
}
