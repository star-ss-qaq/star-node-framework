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
		post: PostRouteOption;
		get: GetRouteOption;
		put: PutRouteOption;
		delete: DeleteRouteOption;
	},
	SubRouteOption
>("web");
export type RouteType<M extends Method> = RouteMetadataRouteType<
	typeof routeMetadata,
	M
>;

export const Get = routeMetadata.route("get");
export const Post = routeMetadata.route("post");
export const Put = routeMetadata.route("put");
export const Delete = routeMetadata.route("delete");
export const SubRoute = routeMetadata.subRoute.bind(routeMetadata);

export function parseRoute(obj: object) {
	return routeMetadata.parse(obj);
}
