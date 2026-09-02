import { SFPluging } from "../plugin/index.js";

export interface SFConfig {
	entry?: string;
	useDi?: boolean;
	pluging?: SFPluging[];
}
