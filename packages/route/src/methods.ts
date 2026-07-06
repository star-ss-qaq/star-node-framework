import { initMetadata } from "@thestarweb/star-framework-utils";
import { routeDataKey } from "./consts.js";
import { RouteMeta } from "./types.js";

function setRouteMetadata(
	type: string,
	path: string | undefined,
	target: any,
	fnKey: string | symbol,
) {
	initMetadata<RouteMeta[]>(target, routeDataKey, "", []).push({
		type,
		path,
		fnKey,
	});
}
function createMethod(type: string) {
	return function (path?: string): MethodDecorator {
		return function (target: any, propertyKey: string | symbol) {
			setRouteMetadata(type, path, target, propertyKey);
		};
	};
}

export const Get = createMethod("get");
export const Post = createMethod("post");
export const SubRoute = function (path?: string): PropertyDecorator {
	return function (target: any, propertyKey: string | symbol) {
		setRouteMetadata("sub-route", path, target, propertyKey);
	};
};
