import { paramMeta } from "../params/index.js";
import { RouteType } from "../route/index.js";
import { Method } from "../route/types.js";

export type CallProp<M extends Method = Method> = Parameters<
	typeof paramMeta.call
>[2] & {
	url: URL;
	method: M;
	route: RouteType<M>;
};
