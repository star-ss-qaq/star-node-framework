import { getMetadataAll, initMetadata } from "@thestarweb/star-framework-utils";
import { Interceptor } from "./types.js";
export * from "./types.js";
export { middlewareToInterceptor } from "./middleware-to-interceptor/index.js";
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
export function addInterceptor(
	interceptor: Interceptor | Interceptor[],
	target: any,
	propertyKey?: PropertyKey,
) {
	initMetadata(target, metaKey, propertyKey, [] as Interceptor[]).push(
		...[interceptor].flat(2),
	);
}
export function getInterceptors(target: object, propertyKey?: PropertyKey) {
	return getMetadataAll<Interceptor[]>(target, metaKey, propertyKey).flat();
}
