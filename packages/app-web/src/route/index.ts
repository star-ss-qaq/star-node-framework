import {
	RouteMetadata,
	type RouteMetadataRouteType,
} from "@thestarweb/star-framework-route";
import {
	CommonRouteOption,
	DeleteRouteOption,
	GetRouteOption,
	Method,
	PostRouteOption,
	PutRouteOption,
	SubRouteOption,
} from "./types.js";

const routeMetadata = new RouteMetadata<
	Method,
	CommonRouteOption,
	{
		POST: PostRouteOption;
		GET: GetRouteOption;
		PUT: PutRouteOption;
		DELETE: DeleteRouteOption;
	},
	SubRouteOption
>("web");
export type RouteType<M extends Method> = RouteMetadataRouteType<
	typeof routeMetadata,
	M
>;

export const Get = routeMetadata.route("GET");
export const Post = routeMetadata.route("POST");
export const Put = routeMetadata.route("PUT");
export const Delete = routeMetadata.route("DELETE");
export const SubRoute = routeMetadata.subRoute.bind(routeMetadata);

export function parseRoute(obj: object) {
	return routeMetadata.parse(obj);
}
