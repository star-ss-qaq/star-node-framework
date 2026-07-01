export interface BaseParamType {
	readonly defaultValue?: () => any;
	readonly constructor?: any;
	readonly metchType?: any;
}
export interface NeverParamType extends BaseParamType {
	readonly type: "never";
}
export interface AnyParamType extends BaseParamType {
	readonly type: "any";
}
export interface StringParamType extends BaseParamType {
	readonly type: "string";
	readonly maxLength?: number;
	readonly minLength?: number;
}
export interface NumberParamType extends BaseParamType {
	readonly type: "number" | "integer";
	readonly max?: number;
	readonly min?: number;
}
export interface BooleanParamType extends BaseParamType {
	readonly type: "boolean";
}
export interface DateParamType extends BaseParamType {
	readonly type: "date";
}
export interface ArrayBuffParamType extends BaseParamType {
	readonly type: "arrayBuffer";
}
export interface EnumParamType extends BaseParamType {
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
export interface ObjectParamType extends BaseParamType {
	readonly type: "object";
	readonly properties: Record<string, ParamType>;
	readonly required: readonly string[];
	readonly additionalProperties?: ParamType;
}
export interface ArrayParamType extends BaseParamType {
	readonly type: "array";
	readonly items: ParamType;
}

export interface AnyOfType extends BaseParamType {
	readonly type: "anyOf";
	readonly anyOf: readonly ParamType[];
}

export type ParamType =
	| NeverParamType
	| AnyParamType
	| StringParamType
	| NumberParamType
	| BooleanParamType
	| DateParamType
	| ArrayBuffParamType
	| EnumParamType
	| ObjectParamType
	| ArrayParamType
	| AnyOfType;
