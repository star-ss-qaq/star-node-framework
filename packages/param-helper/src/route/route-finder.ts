import { createRouter, RadixRouter, toRouteMatcher } from "radix3";
import { routeDataKey } from "./consts.js";
import { RouteMeta } from "./types.js";

interface RouteInfo {
	path: string;
	obj: object;
	callMode: string;
	method: string | symbol;
	allObj: object[];
}

function getRouyeMeta(obj: any): RouteMeta[] {
	return obj[routeDataKey] || [];
}
function routeFinderInner(
	obj: object,
	pre = "/",
	parents: object[] = [],
	routers: Record<string, RadixRouter<RouteInfo>> = {},
) {
	const metadata = getRouyeMeta(obj);
	const allObj = [...parents, obj];
	metadata.forEach((element) => {
		let path = element.path || "";
		if (!path.startsWith("/")) path = `${pre}${path}`;
		const { type } = element;
		if (element.type === "sub-route") {
			if (!path.endsWith("/")) path += "/";
			routeFinderInner((obj as any)[element.fnKey], path, allObj, routers);
		} else {
			if (!(type in routers)) {
				routers[type] = createRouter();
			}
			routers[type].insert(path, {
				path,
				obj,
				callMode: element.type,
				method: element.fnKey,
				allObj,
			});
		}
	});
	return routers;
}
export function routeFinder(obj: object) {
	const router = routeFinderInner(obj);
	return (method: string, path: string) => {
		return router[method]?.lookup(path);
	};
}
