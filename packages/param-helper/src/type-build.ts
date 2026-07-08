import { ParamType } from "./types.js";

export type ParamTypeTransformer = Partial<
	Omit<
		{
			[K in ParamType["type"]]: (
				value: any,
				type: ParamType & { type: K },
			) => any;
		},
		"never" | "any" | "anyOf" | "enum"
	>
>;

export const defaultTransformer: ParamTypeTransformer = {
	number: (value) => {
		if (
			typeof value === "string" &&
			/^[+-]?[\d+|\.]+$/.test(value) &&
			value.split(".", 3).length <= 2
		) {
			const num = parseFloat(value);
			if (
				!isNaN(num) &&
				num < Number.MAX_SAFE_INTEGER &&
				num > Number.MIN_SAFE_INTEGER
			) {
				return num;
			}
		}
	},
	integer: (value) => {
		if (typeof value === "string" && /^[+-]?\d+$/.test(value)) {
			const num = parseInt(value);
			if (
				!isNaN(num) &&
				num < Number.MAX_SAFE_INTEGER &&
				num > Number.MIN_SAFE_INTEGER
			) {
				return num;
			}
		}
	},
};

export function buildType(
	type: ParamType,
	data: any,
	transformer = defaultTransformer,
	path: string = "root",
): any {
	const throwError = (message: string): never => {
		throw new Error(`Param error at ${path}: ${message}`);
	};
	const transformandCheckOrThrow = (checker: (value: any) => boolean) => {
		if (checker(data)) return data;
		if (transformer[type.type as keyof ParamTypeTransformer]) {
			const newValue = (
				transformer[type.type as keyof ParamTypeTransformer] as any
			)(data, type);
			if (checker(newValue)) return newValue;
		}
		throwError(`need ${type.type}, but got ${String(data)}`);
	};
	switch (type.type) {
		case "never":
			throwError("it can not set any type value");
		case "any":
			return data;
		case "anyOf":
			// 这个略微复杂
			const errs = ["no type metch for it:"];
			for (let mayType of type.anyOf) {
				try {
					return buildType(mayType, data, transformer, path);
				} catch (e) {
					if (e instanceof Error) {
						errs.push(e.message);
					}
				}
			}
			throwError(errs.join("\n\t"));
			return;
		case "array": {
			const value: any[] = transformandCheckOrThrow((v) => Array.isArray(v));
			const itemType = type.items;
			if (Array.isArray(itemType)) {
				if (itemType.length !== value.length) {
					throw new Error(
						`need ${itemType.length} item, but got ${value.length}`,
					);
				}
				return value.map((item: any, index) =>
					buildType(itemType[index], item, transformer, `${path}[${index}]`),
				);
			}
			return value.map((item: any, index) =>
				buildType(itemType, item, transformer, `${path}[${index}]`),
			);
		}
		case "string":
			return transformandCheckOrThrow((value) => typeof value === "string");
		case "number":
			return transformandCheckOrThrow((value) => typeof value === "number");
		case "integer":
			return transformandCheckOrThrow(
				(value) => typeof value === "number" && value % 1 === 0,
			);
		case "boolean":
			return transformandCheckOrThrow((value) => typeof value === "boolean");
		case "enum":
			return transformandCheckOrThrow((value) => type.values.includes(value));
		case "arrayBuffer": {
			const ret = transformandCheckOrThrow(
				(value) => value instanceof ArrayBuffer,
			);
			if (type.constructor) {
				Object.setPrototypeOf(ret, type.constructor);
			}
			return ret;
		}
		case "date": {
			const ret = transformandCheckOrThrow((value) => value instanceof Date);
			if (type.constructor) {
				Object.setPrototypeOf(ret, type.constructor);
			}
			return ret;
		}
		case "object":
			const obj = transformandCheckOrThrow(
				(value) => value && typeof value === "object",
			);
			if (type.required.some((f) => !(f in obj))) {
				throwError(
					`field ${type.required.find((f) => !(f in obj))} is required`,
				);
			}
			const entries = Object.keys(obj)
				.map((k): [PropertyKey, any] | void => {
					if (k in type.properties) {
						return [
							k,
							buildType(
								type.properties[k],
								obj[k],
								transformer,
								`${path}.${k}`,
							),
						];
					} else if (type.additionalProperties) {
						return [
							k,
							buildType(
								type.additionalProperties,
								obj[k],
								transformer,
								`${path}.${k}`,
							),
						];
					}
				})
				.filter(Boolean) as [PropertyKey, any];
			let retObj;
			if (type.metchType === Map) {
				retObj = new Map(entries);
			} else {
				retObj = Object.fromEntries(entries);
			}
			if (Object.hasOwn(type, "constructor")) {
				Object.setPrototypeOf(retObj, type.constructor);
			}
			return retObj;
		default:
		// 不应该能走到这个位置
		// type.type;
	}
	// @ts-ignore
	throwError(`unknow type ${type.type}`);
}
