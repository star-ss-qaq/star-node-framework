export interface RouteObjectInfo<T> {
	path: string;
	obj: object;
	context?: T;
}
export interface RouteObjectCallInfo<T> extends RouteObjectInfo<T> {
	propertyKey: PropertyKey;
}
export interface RouteInfoInput<T = any, RT = any> {
	allRoute: RouteObjectCallInfo<RT>[];
	finalRoute?: RouteObjectCallInfo<T> | undefined;
}
export interface RouteInfo<T = any, RT = any> extends RouteInfoInput<T, RT> {
	params?: Record<string, string>;
}
