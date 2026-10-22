import { SFWebRequest } from "../../request/index.js";
import { RouteType } from "../../route/index.js";
import { SFDataContext } from "./context.js";
export * from "./context.js";
export interface SystemRenderDataContext {
	route: SFDataContext<RouteType<"GET">>;
	request: SFWebRequest;
	baseUrl: string;
}
export interface UserRenderDataContext extends Record<
	string,
	SFDataContext<any>
> {}

export interface RenderDataContext {
	system: SystemRenderDataContext;
	user: UserRenderDataContext;
}
