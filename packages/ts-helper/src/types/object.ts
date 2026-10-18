export type DeepPartial<T> = Partial<{ [P in keyof T]: DeepPartial<T[P]> }>;
export type Union<U> = (U extends any ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never;
/**
 * 获取对象所有string类型的key
 */
export type StringKeyOf<T extends {}> = {
	[K in keyof T]: K extends string ? K : never;
}[keyof T];
