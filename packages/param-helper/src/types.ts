export interface BaseParamType<T> {
	readonly defaultValue?: () => any;
	readonly description?: string;
	readonly meta?: T;
	readonly constructor?: any;
	readonly matchType?: any;
}
export enum ParamTypeEnum {
	Never = -1,
	Any = 0,
	String = 1,
	Number = 2,
	Boolean = 3,
	Int = 4,
	BigInt = 5,
	Array = 11,
	Object = 12,
	AnyOf = 51,
	Enum = 52,
	RawClass = 101,
}
export interface NeverParamType<T = any> extends BaseParamType<T> {
	readonly type: ParamTypeEnum.Never;
}
export interface AnyParamType<T = any> extends BaseParamType<T> {
	readonly type: ParamTypeEnum.Any;
}
export interface StringParamType<T = any> extends BaseParamType<T> {
	readonly type: ParamTypeEnum.String;
	readonly maxLength?: number;
	readonly minLength?: number;
}
export interface NumberParamType<T = any> extends BaseParamType<T> {
	readonly type:
		| ParamTypeEnum.Number
		| ParamTypeEnum.Int
		| ParamTypeEnum.BigInt;
	readonly max?: number;
	readonly min?: number;
}
export interface BooleanParamType<T = any> extends BaseParamType<T> {
	readonly type: ParamTypeEnum.Boolean;
}
export interface EnumParamType<T = any> extends BaseParamType<T> {
	readonly type: ParamTypeEnum.Enum;
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
	readonly type: ParamTypeEnum.Object;
	readonly properties: Record<string, ParamType>;
	readonly required: readonly string[];
	readonly additionalProperties?: ParamType;
}
export interface ArrayParamType<T = any> extends BaseParamType<T> {
	readonly type: ParamTypeEnum.Array;
	readonly items: ParamType | ParamType[];
}

export interface AnyOfParamType<T = any> extends BaseParamType<T> {
	readonly type: ParamTypeEnum.AnyOf;
	readonly anyOf: readonly ParamType[];
}

export interface RawClassParamType<T = any> extends BaseParamType<T> {
	readonly type: ParamTypeEnum.RawClass;
	readonly constructor: any;
}

export type ParamType<T = any> =
	| NeverParamType<T>
	| AnyParamType<T>
	| StringParamType<T>
	| NumberParamType<T>
	| BooleanParamType<T>
	| EnumParamType<T>
	| ObjectParamType<T>
	| ArrayParamType<T>
	| AnyOfParamType<T>
	| RawClassParamType<T>;
