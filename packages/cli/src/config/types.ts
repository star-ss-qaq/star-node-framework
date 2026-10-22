import { SFPluging } from "../plugin/index.js";
import { Plugin } from "vite";

export interface SFConfig {
	entry?: string;
	useDi?: boolean;
	plugin?: SFPluging[];
	vitePlugin?: Plugin[];
}
