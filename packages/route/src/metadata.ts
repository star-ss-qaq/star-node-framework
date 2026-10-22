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

export type RouteMetadataRouteType<R extends RouteMetadata, M> =
	R extends RouteMetadata<
		infer T,
		infer CommonOption,
		infer TypeOption,
		infer SubRouteOption
	>
		? M extends T
			? RouteInfo<
					Partial<{} & CommonOption & TypeOption[M]>,
					Partial<SubRouteOption>
				>
			: never
		: never;

export type ResolveRouteMetaType<
	T extends string,
	CommonOption extends {},
	TypeOption extends Partial<Record<T, Record<string, any>>>,
	SubRouteOption extends {},
> = RouteInfo<
	Partial<{} & CommonOption & TypeOption[T]>,
	Partial<SubRouteOption>
>;

export class RouteMetadata<
	T extends string = string,
	CommonOption extends {} = {},
	TypeOption extends Partial<Record<T, Record<string, any>>> = {},
	SubRouteOption extends {} = {},
> {
	constructor(private namespace: string) {
		this.routeMetaKey = `${routeDataKey}:${namespace}`;
		this.subRoute.bind(this);
	}
	private readonly routeMetaKey: string;
	_route<
		R extends
			| MethodDecorator
			| PropertyDecorator
			| (MethodDecorator & PropertyDecorator),
		M extends T,
	>(type: M) {
		const { routeMetaKey } = this;
		return function (
			path?: string,
			context?: Partial<CommonOption & TypeOption[M]>,
		) {
			return function (target: any, propertyKey: string | symbol) {
				initMetadata<RouteMeta[]>(target, routeMetaKey, undefined, []).push({
					type,
					path,
					fnKey: propertyKey,
					context,
					isSubRoute: false,
				});
			} as R;
		};
	}

	route<M extends T>(type: M) {
		return this._route<MethodDecorator & PropertyDecorator, M>(type);
	}
	dynRoute<M extends T>(type: M) {
		return this._route<MethodDecorator, M>(type);
	}
	staticRoute<M extends T>(type: M) {
		return this._route<PropertyDecorator, M>(type);
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
	private _routeFinder(
		objInfo: RouteObjectInfo<SubRouteOption>,
		callback: <TT extends T | "__SF:NotFind">(
			type: TT,
			path: string,
			t: ResolveRouteMetaType<T, CommonOption, TypeOption, SubRouteOption>,
		) => void,
		parents: RouteObjectCallInfo<SubRouteOption>[] = [],
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
				this._routeFinder(
					{
						obj: (objInfo.obj as any)[element.fnKey],
						path,
						context: element.context,
					},
					callback,
					allRoute,
				);
			} else {
				callback(type as T, path, {
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
		callback("__SF:NotFind", `${path}**`, {
			allRoute: [...parents, { ...objInfo, propertyKey: "" }],
		});
	}
	routeFinder(objInfo: RouteObjectInfo<SubRouteOption>) {
		const routers: {
			[K in T]?: RadixRouter<
				RouteInfo<
					Partial<{} & CommonOption & TypeOption[K]>,
					Partial<SubRouteOption>
				>
			>;
		} & {
			"__SF:NotFind": RadixRouter<RouteInfo<any, Partial<SubRouteOption>>>;
		} = { "__SF:NotFind": createRouter() };
		this._routeFinder(objInfo, (type, path, meta) => {
			if (!(type in routers)) {
				routers[type] = createRouter() as any;
			}
			routers[type]!.insert(path, meta);
		});
		return routers;
	}
	routeFinderFlat(obj: object) {
		const routers: {
			[K in T]?: Map<
				string,
				RouteInfo<
					Partial<{} & CommonOption & TypeOption[K]>,
					Partial<SubRouteOption>
				>
			>;
		} & {
			"__SF:NotFind"?: Map<string, RouteInfo<any, Partial<SubRouteOption>>>;
		} = {};
		this._routeFinder({ obj, path: "/" }, (type, path, meta) => {
			if (!routers[type]) {
				routers[type] = new Map() as any;
			}
			routers[type]!.set(path, meta);
		});
		return routers;
	}
	parse(obj: any) {
		const router = this.routeFinder({ obj, path: "/" });
		return <M extends T>(method: M, path: string) => {
			return (
				router[method]?.lookup(path) ||
				router["__SF:NotFind"].lookup(path) || { allRoute: [] }
			);
		};
	}
}
