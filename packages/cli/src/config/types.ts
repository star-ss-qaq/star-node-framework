import { SFPluging } from "../plugin/index.js";
import { Plugin, UserConfig } from "vite";

export interface SFConfig {
	entry?: string;
	useDi?: boolean;
	plugin?: SFPluging[];
	vitePlugin?: Plugin[];
	define?: Record<string, string>;
	resolve?: UserConfig["resolve"];
}
