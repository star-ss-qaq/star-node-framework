export function initMetadata(obj: any, key: string, defalutValue: any = {}) {
	if (!obj[key]) {
		Object.defineProperty(obj, key, {
			enumerable: false,
			value: defalutValue,
		});
	}
	return obj[key];
}
