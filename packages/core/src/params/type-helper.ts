import {
	ReflectionClass,
	ReflectionKind,
	Type,
	TypeClass,
	TypeProperty,
} from "@deepkit/type";
import {
	AnyParamType,
	ArrayBuffParamType,
	ArrayParamType,
	BooleanParamType,
	DateParamType,
	EnumParamType,
	NeverParamType,
	NumberParamType,
	ObjectParamType,
	ParamType,
	StringParamType,
} from "./types";

/**
 * 将传入对象制作成没有原型链且被冻结的对象
 */
function pureAndFreeze<T>(obj: T): T {
	if (Array.isArray(obj)) {
		return Object.freeze(obj);
	}
	const ret = Object.create(null);
	Object.defineProperties(ret, Object.getOwnPropertyDescriptors(obj));
	return Object.freeze(ret);
}

const defaultNeverType = pureAndFreeze<NeverParamType>({ type: "never" });
const defaultAnyType = pureAndFreeze<AnyParamType>({ type: "any" });
const defaultStringType = pureAndFreeze<StringParamType>({ type: "string" });
const defaultNumberType = pureAndFreeze<NumberParamType>({ type: "number" });
const defaultBooleanType = pureAndFreeze<BooleanParamType>({ type: "boolean" });
const defaultDateType = pureAndFreeze<DateParamType>({ type: "date" });
const defaultArrayBufferType = pureAndFreeze<ArrayBuffParamType>({
	type: "arrayBuffer",
});

const systemClassRules: [
	any,
	(getTypeParam: (index: number) => ParamType | undefined) => ParamType,
][] = [
	[Date, () => defaultDateType],
	[ArrayBuffer, () => defaultArrayBufferType],
	[
		Set,
		(getTypeParam) => ({
			type: "array",
			items: getTypeParam(0) || defaultAnyType,
			metchType: Set,
		}),
	],
	[
		Map,
		(getTypeParam) => ({
			type: "object",
			properties: {},
			required: [],
			additionalProperties: getTypeParam(1) || defaultAnyType,
		}),
	],
];

function mergeUnionType(types: ParamType[]): ParamType {
	if (types.length === 0) {
		return defaultNeverType;
	}
	const typesMap: Record<ParamType["type"], ParamType[]> = Object.create(null);
	function unpackType(types: readonly ParamType[]) {
		types.forEach((t) => {
			if (t.type === "anyOf") {
				unpackType(t.anyOf);
			} else if (t.type !== "never") {
				if (!(t.type in typesMap)) {
					typesMap[t.type] = [];
				}
				typesMap[t.type].push(t);
			}
		});
	}
	unpackType(types);
	// 如果有any类型，那么直接返回any类型，因为any类型可以匹配所有类型
	if (typesMap.any) return defaultAnyType;
	// 没有单独参数的目前都统一使用同一个（暂时不支持校验参数等）
	(["number", "string", "boolean", "date", "arrayBuffer"] as const).forEach(
		(type) => {
			if (typesMap[type]?.length > 1) {
				typesMap[type].length = 1;
			}
		},
	);
	if (typesMap.enum) {
		const unMergeableValue = [
			...new Set(typesMap.enum.flatMap((t) => (t as EnumParamType).values)),
		].filter((v) => {
			const valueType = typeof v;
			if (typesMap[valueType as keyof typeof typesMap]?.length > 0) {
				switch (valueType) {
					default:
						// 默认全部可以合并到对应的类型中
						return false;
				}
			}
			return true;
		});
		typesMap.enum =
			unMergeableValue.length > 0
				? // 如果有无法合并的枚举值，那么就把这些值单独放到一个枚举类型中
					[
						{
							type: "enum",
							values: pureAndFreeze(unMergeableValue),
						},
					]
				: // 如果所有枚举类型都已经合并，那么就不需要再保留原来的枚举类型了
					[];
	}
	const finalList = Object.values(typesMap).flat();
	if (finalList.length === 0) {
		return defaultNeverType;
	}
	if (finalList.length === 1) {
		return finalList[0];
	}
	return {
		type: "anyOf",
		anyOf: pureAndFreeze(finalList),
	};
}
export class ParamTypeError extends Error {}
export function toParamType(
	type: Type,
	p = "",
	defaultValue?: () => any,
	noError = false,
): ParamType {
	function warp(baseType: ParamType): ParamType {
		if (defaultValue) {
			return pureAndFreeze({ defaultValue, ...baseType });
		}
		return pureAndFreeze(baseType);
	}
	function error(msg: string): never | ParamType {
		if (noError) {
			return defaultNeverType;
		}
		throw new ParamTypeError(
			`${p}(${type.typeName || "anonymity"}) could not use for param, because ${msg}`,
		);
	}
	switch (type.kind) {
		case ReflectionKind.literal:
			if (typeof type.literal === "object" && type.literal !== null) {
				return error("literal value cannot be object or array");
			}
			return warp({
				type: "enum",
				values: pureAndFreeze([type.literal]),
			});
		case ReflectionKind.any:
		case ReflectionKind.unknown:
			return defaultAnyType;
		case ReflectionKind.string:
			return defaultStringType;
		case ReflectionKind.number:
			return defaultNumberType;
		case ReflectionKind.boolean:
			return defaultBooleanType;
		case ReflectionKind.enum:
			return warp({
				type: "enum",
				values: pureAndFreeze(type.values),
				enum: type.enum,
			});
		case ReflectionKind.array:
			return warp({ type: "array", items: toParamType(type.type, p) });
		case ReflectionKind.class:
			const { classType } = type;
			let rule = systemClassRules.find(([superCls]) => classType === superCls);
			let typeArg = type.arguments;
			const getTypeParam = (index: number) => {
				const t = typeArg?.[index];
				if (!t) return undefined;
				return toParamType(t, `${p}.<${index}>`);
			};
			if (rule) {
				return warp(rule[1](getTypeParam));
			}
			let current = ReflectionClass.from(classType).getSuperReflectionClass();
			typeArg = type.extendsArguments;
			while (current) {
				const { classType, extendsArguments } = current.type as TypeClass;
				let rule = systemClassRules.find(
					([superCls]) => classType === superCls,
				);
				if (rule) {
					// TODO: 如果子类有自己的属性的话，应该要确保没有自定义的子类属性，否则还原不出来
					return warp({
						...rule[1](getTypeParam),
						constructor: type.classType,
					});
				}
				typeArg = extendsArguments;
				current = current.getSuperReflectionClass();
			}
		case ReflectionKind.objectLiteral:
			const required: string[] = [];
			const properties: Record<string, ParamType> = {};
			let additionalProperties: ParamType | undefined;
			let constructor: any;
			if (type.kind === ReflectionKind.class) {
				constructor = type.classType;
			}
			for (const t of type.types) {
				switch (t.kind) {
					case ReflectionKind.method:
					case ReflectionKind.methodSignature:
						if (t.optional || t.kind === ReflectionKind.method) {
							if (typeof t.name === "string") {
								properties[t.name] = defaultNeverType;
							}
							continue;
						}
						return error(
							`it has method signature (${String(t.name)}) and it is not optional`,
						);
					case ReflectionKind.property:
					case ReflectionKind.propertySignature:
						const { name, type: subType, optional } = t;
						if (typeof name != "string") {
							if (optional) {
								continue;
							}
							return error(
								"it has a symbol key and it is not optional or have default value",
							);
						}
						if (!optional) required.push(name);
						properties[name] = toParamType(
							subType,
							`${p}.${name}`,
							(t as TypeProperty).default,
							t.optional,
						);
						break;
					case ReflectionKind.callSignature:
						return error("it has call signature");
					default:
						return error("it has unkonw type metadata");
				}
			}
			return warp({
				type: "object",
				properties: pureAndFreeze(properties),
				required: pureAndFreeze(required),
				additionalProperties,
				constructor,
			});
		case ReflectionKind.union:
			return warp(mergeUnionType(type.types.map((t) => toParamType(t, p))));
		case ReflectionKind.function:
			return error("it is a function");
	}
	return error(`it has unkonw type metadata`);
}
export function mergeType(
	rawType?: ParamType,
	addType?: ParamType,
	p: string = "",
	path?: string,
	required = false,
): ParamType {
	if (path)
		return mergeType(
			rawType,
			pureAndFreeze({
				type: "object",
				properties: pureAndFreeze({ [path]: addType! }),
				required: pureAndFreeze(required ? [path] : []),
			}),
			p,
		);
	if (rawType?.type === "never" || addType?.type === "never") {
		return defaultNeverType;
	}
	if (!rawType || rawType.type === "any") return addType!;
	if (!addType || addType.type === "any") return rawType!;
	if (rawType.type !== addType.type) {
		throw new ParamTypeError(
			`${p} is required to be ${rawType.type} and ${addType.type} at same time, but they are not compatible`,
		);
	}
	function _typeName(type: ParamType) {
		if (type.constructor) {
			if (type.metchType) {
				return `${type.constructor.name}(extend ${type.metchType.name})`;
			}
			return type.constructor.name;
		}
		if (type.metchType) {
			return type.metchType.name;
		}
		return `default ${type.type}`;
	}
	if (rawType.constructor !== addType.constructor) {
		// TODO 如果是继承关系 那么可以兼容
		throw new ParamTypeError(
			`${p} is required to be ${_typeName(rawType)} and ${_typeName(addType)} at same time, we can not handle it`,
		);
	}
	// TODO 如果有anyOf需要逐个尝试
	// 但这也非常复杂且极少遇到，本身占用同一个参数位置就不是预期行为
	if (rawType.metchType !== addType.metchType) {
		throw new ParamTypeError(
			`${p} is required to be ${_typeName(rawType)} and ${_typeName(addType)} at same time, we can not handle it`,
		);
	}
	switch (rawType.type) {
		case "array":
			return pureAndFreeze({
				type: "array",
				items: mergeType(rawType.items, (addType as ArrayParamType).items, p),
			});
		case "object":
			const a = addType as ObjectParamType;
			const allProperties = [
				...new Set([
					...Object.keys(rawType.properties),
					...Object.keys(a.properties),
				]),
			];
			return pureAndFreeze({
				type: "object",
				properties: pureAndFreeze(
					Object.fromEntries(
						allProperties.map((key) => [
							key,
							mergeType(
								rawType.properties[key],
								a.properties[key],
								`${p}.${key}`,
							),
						]),
					),
				),
				required: pureAndFreeze([
					...new Set([...rawType.required, ...a.required]),
				]),
			});
		case "enum":
		// TODO
	}
	return rawType;
}
