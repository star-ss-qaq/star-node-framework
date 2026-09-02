import {
	DevEnvironment,
	InlineConfig,
	type RunnableDevEnvironment,
	ViteDevServer,
} from "vite";

export interface SFDevHook {
	createViteServer?(
		config: InlineConfig,
	): ViteDevServer | Promise<ViteDevServer>;
	onViteServerInited?(vite: ViteDevServer): void;
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
	environments?: string | string[];
	side?: StarFrameworkSide | StarFrameworkSide[];
}
export interface SFPluging {
	name: string;
	mode?: Record<string, SFModeConfig>;
}
