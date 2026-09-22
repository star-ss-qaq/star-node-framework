import { RouteType } from "../../route/index.js";
import { SFDataContext } from "./conetext.js";
export * from "./conetext.js";
export interface SystemRenderDataContext {
	route: SFDataContext<RouteType<"GET">>;
	request: SFDataContext<any>;
}
export interface UserRenderDataContext extends Record<
	string,
	SFDataContext<any>
> {}

export interface RenderDataContext {
	system: SystemRenderDataContext;
	user: UserRenderDataContext;
}
