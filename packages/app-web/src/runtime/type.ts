import { paramMeta } from "../params/index.js";
import { parseRoute, RouteType } from "../route/index.js";
import { Method } from "../route/types.js";

export interface ServerInstanceConfig {
	main: object;
	if?: (url: URL) => boolean;
	importent?: number;
}
export interface ServerConfig {
	instances: ServerInstanceConfig[];
	port: number;
}

export type CallProp<M extends Method = Method> = Parameters<
	typeof paramMeta.call
>[2] & {
	url: URL;
	method: M;
	route: RouteType<M>;
};
