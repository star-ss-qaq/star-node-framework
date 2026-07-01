import { ReflectionKind, TypeClass, TypeMethod } from "@deepkit/type";

export function initMetadata<T extends {} = any>(obj: any, key: PropertyKey): T;
export function initMetadata<T>(obj: any, key: PropertyKey, defalutValue: T): T;
export function initMetadata(
	obj: any,
	key: PropertyKey,
	defalutValue = Object.create(null) as any,
) {
	if (!obj[key]) {
		Object.defineProperty(obj, key, {
			enumerable: false,
			value: defalutValue,
		});
	}
	return obj[key];
}
