import { getMetadata, initMetadata } from "@thestarweb/star-framework-utils";
import { routeDataKey } from "./consts.js";
import { createRouter, RadixRouter } from "radix3";
import { RouteInfo, RouteObjectCallInfo, RouteObjectInfo } from "./types.js";

export interface RouteMeta {
	type: string;
	path: string | undefined;
	fnKey: string | symbol;
	context: any;
	isSubRoute: boolean;
}
export class RouteMetadata<
	T extends string = string,
	CommonOption extends {} = {},
	TypeOption extends Partial<Record<T, Record<string, any>>> = {},
	SubRouteOption extends {} = {},
> {
	constructor(private namespase: string) {
		this.routeMetaKey = `${routeDataKey}:${namespase}`;
		this.subRoute.bind(this);
	}
	private readonly routeMetaKey: string;
	route(type: string) {
		const { routeMetaKey } = this;
		return function (
			path?: string,
			context?: Partial<CommonOption & TypeOption[T]>,
		): MethodDecorator {
			return function (target: any, propertyKey: string | symbol) {
				initMetadata<RouteMeta[]>(target, routeMetaKey, undefined, []).push({
					type,
					path,
					fnKey: propertyKey,
					context,
					isSubRoute: false,
				});
			};
		};
	}
	subRoute(
		path?: string,
		context?: Partial<SubRouteOption>,
	): PropertyDecorator {
		const { routeMetaKey } = this;
		return function (target: any, propertyKey: string | symbol) {
			initMetadata<RouteMeta[]>(target, routeMetaKey, undefined, []).push({
				type: "",
				path,
				fnKey: propertyKey,
				context,
				isSubRoute: true,
			});
		};
	}
	routeFinder(
		objInfo: RouteObjectInfo<SubRouteOption>,
		parents: RouteObjectCallInfo<SubRouteOption>[] = [],
		routers: {
			[K in T]?: RadixRouter<
				RouteInfo<
					Partial<{} & CommonOption & TypeOption[K]>,
					Partial<SubRouteOption>
				>
			>;
		} & {
			"__SF:NotFind": RadixRouter<RouteInfo<any, Partial<SubRouteOption>>>;
		} = { "__SF:NotFind": createRouter() },
	) {
		const metadata = getMetadata<RouteMeta[]>(
			objInfo.obj,
			this.routeMetaKey,
			"",
			[],
		);
		metadata.forEach((element) => {
			let path = element.path || "";
			if (!path.startsWith("/")) path = `${objInfo.path}${path}`;
			const allRoute = [...parents, { ...objInfo, propertyKey: element.fnKey }];
			const { type } = element;
			if (element.isSubRoute) {
				if (!path.endsWith("/")) path += "/";
				this.routeFinder(
					{
						obj: (objInfo.obj as any)[element.fnKey],
						path,
						context: element.context,
					},
					allRoute,
					routers,
				);
			} else {
				if (!(type in routers)) {
					routers[type as T] = createRouter() as any;
				}
				routers[type as T]!.insert(path, {
					allRoute,
					finalRoute: {
						propertyKey: element.fnKey,
						path,
						obj: objInfo.obj,
						context: element.context,
					},
				});
			}
		});
		let path = objInfo.path || "";
		routers["__SF:NotFind"].insert(`${path}*`, {
			allRoute: [...parents, { ...objInfo, propertyKey: "" }],
		});
		return routers;
	}
	parse(obj: any) {
		const router = this.routeFinder({ obj, path: "/" });
		return <M extends T>(
			method: M,
			path: string,
		): RouteInfo<
			Partial<{} & CommonOption & TypeOption[M]>,
			Partial<SubRouteOption>
		> => {
			return (
				router[method]?.lookup(path) ||
				router["__SF:NotFind"].lookup(path) || { allRoute: [] }
			);
		};
	}
}
// const a = new RouteMetadata<
// 	"get" | "post",
// 	{ common: 1 },
// 	{ get: { get: 1 }; post: { post: 1 } },
// 	{ subRoute: 1 }
// >("t1");
// const b = a.parse({})("get", "/");
