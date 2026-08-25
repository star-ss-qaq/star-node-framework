import { paramMeta } from "../params/index.js";

export interface ServerInstanceConfig {
	main: object;
	if?: (url: URL) => boolean;
	importent?: number;
}
export interface ServerConfig {
	instances: ServerInstanceConfig[];
	port: number;
}
export type CallProp = Parameters<typeof paramMeta.call>[2];
