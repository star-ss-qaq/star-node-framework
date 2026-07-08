export interface BaseParamType<T> {
	readonly defaultValue?: () => any;
	readonly description?: string;
	readonly meta?: T;
	readonly constructor?: any;
	readonly metchType?: any;
}
export interface NeverParamType<T = any> extends BaseParamType<T> {
	readonly type: "never";
}
export interface AnyParamType<T = any> extends BaseParamType<T> {
	readonly type: "any";
}
export interface StringParamType<T = any> extends BaseParamType<T> {
	readonly type: "string";
	readonly maxLength?: number;
	readonly minLength?: number;
}
export interface NumberParamType<T = any> extends BaseParamType<T> {
	readonly type: "number" | "integer";
	readonly max?: number;
	readonly min?: number;
}
export interface BooleanParamType<T = any> extends BaseParamType<T> {
	readonly type: "boolean";
}
export interface DateParamType<T = any> extends BaseParamType<T> {
	readonly type: "date";
}
export interface ArrayBuffParamType<T = any> extends BaseParamType<T> {
	readonly type: "arrayBuffer";
}
export interface EnumParamType<T = any> extends BaseParamType<T> {
	readonly type: "enum";
	enum?: Record<string, any>;
	readonly values: readonly (
		| string
		| number
		| bigint
		| boolean
		| symbol
		| null
		| undefined
	)[];
}
export interface ObjectParamType<T = any> extends BaseParamType<T> {
	readonly type: "object";
	readonly properties: Record<string, ParamType>;
	readonly required: readonly string[];
	readonly additionalProperties?: ParamType;
}
export interface ArrayParamType<T = any> extends BaseParamType<T> {
	readonly type: "array";
	readonly items: ParamType | ParamType[];
}

export interface AnyOfParamType<T = any> extends BaseParamType<T> {
	readonly type: "anyOf";
	readonly anyOf: readonly ParamType[];
}

export type ParamType<T = any> =
	| NeverParamType<T>
	| AnyParamType<T>
	| StringParamType<T>
	| NumberParamType<T>
	| BooleanParamType<T>
	| DateParamType<T>
	| ArrayBuffParamType<T>
	| EnumParamType<T>
	| ObjectParamType<T>
	| ArrayParamType<T>
	| AnyOfParamType<T>;
