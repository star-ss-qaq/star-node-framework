import { getMetadata, initMetadata } from "@thestarweb/star-framework-utils";
import { Interceptor } from "./types.js";
export type * from "./types.js";
const metaKey = "$sf:app:interceptor";
export function AddInterceptor(
	interceptor: Interceptor | Interceptor[],
): MethodDecorator & ClassDecorator {
	return function (target?: any, propertyKey?: PropertyKey) {
		initMetadata(target, metaKey, propertyKey, [] as Interceptor[]).push(
			...[interceptor].flat(2),
		);
	};
}
export function getInterceptors(target: object, propertyKey?: PropertyKey) {
	return getMetadata(target, metaKey, propertyKey, []) as Interceptor[];
}
