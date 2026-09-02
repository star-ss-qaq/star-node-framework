import { Readable } from "stream";
import { paramMeta } from "../params/index.js";
import { parseRoute, RouteType } from "../route/index.js";
import { Method } from "../route/types.js";

export interface ServerInstanceConfig {
	main: ServerInstance | string;
	if?: (url: URL) => boolean;
	importent?: number;
}
export interface ServerConfig {
	instances: ServerInstanceConfig[];
	port: number;
}

export interface ServerInstance {
	onRequert: (
		method: Method,
		url: string | URL,
		header: any,
		body?: Readable,
	) => Promise<
		| {
				code: number;
				header: any;
				res: Readable | null;
		  }
		| undefined
	>;
}
