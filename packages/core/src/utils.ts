export function initMetadata<T extends {} = any>(obj: any, key: string): T;
export function initMetadata<T>(obj: any, key: string, defalutValue: T): T;
export function initMetadata(obj: any, key: string, defalutValue = {} as any) {
	if (!obj[key]) {
		Object.defineProperty(obj, key, {
			enumerable: false,
			value: defalutValue,
		});
	}
	return obj[key];
}
