import { loadPackage } from "../package-loader/index.js";
import { ResolvedServerInstance } from "./resolved.js";

export type InlineServer = ResolvedServerInstance;
export type ServerInstanceConfig =
	| InlineServer
	| Parameters<typeof loadPackage>[0];


export interface ServerConfig {
	instances: ServerInstanceConfig[];
	port: number;
}
