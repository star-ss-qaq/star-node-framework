const mateRootStorageKey = "$sf:meta-root-storage-key";

export function initMetadata<T extends {} = any>(
	obj: object,
	mateKey: any,
	propertyKey?: PropertyKey,
): T;
export function initMetadata<T>(
	obj: object,
	mateKey: any,
	propertyKey: PropertyKey | undefined,
	defalutValue: T,
): T;
export function initMetadata(
	obj: any,
	mateKey: any,
	propertyKey: PropertyKey = "",
	defalutValue = Object.create(null) as any,
) {
	if (!Object.hasOwn(obj, mateRootStorageKey)) {
		Object.defineProperty(obj, mateRootStorageKey, {
			enumerable: false,
			value: Object.create(null),
		});
	}
	const metaRoot = obj[mateRootStorageKey];
	if (!metaRoot[propertyKey]) {
		metaRoot[propertyKey] = new Map();
	}
	const metaWithProperty = metaRoot[propertyKey];
	if (!metaWithProperty.has(mateKey)) {
		metaWithProperty.set(mateKey, defalutValue);
	}
	return metaWithProperty.get(mateKey);
}

export function getMetadata<T extends {} = any>(
	obj: any,
	mateKey: any,
	propertyKey?: PropertyKey,
): T;
export function getMetadata<T>(
	obj: any,
	mateKey: PropertyKey,
	propertyKey: PropertyKey | undefined,
	defalutValue: T,
): T;
export function getMetadata(
	obj: any,
	mateKey: PropertyKey,
	propertyKey: PropertyKey = "",
	defalutValue = null,
) {
	if (Object.hasOwn(obj, mateRootStorageKey)) {
		const map = obj[mateRootStorageKey][propertyKey];
		if (map?.has(mateKey)) {
			return map.get(mateKey);
		}
	}
	const prototype = Object.getPrototypeOf(obj);
	if (prototype) {
		return getMetadata(prototype, mateKey, propertyKey, defalutValue);
	}
	return defalutValue;
}
