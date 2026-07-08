import {
	ReflectionKind,
	Type,
	TypeClass,
	TypeMethod,
	typeOf,
} from "@deepkit/type";
import { getMetadata, initMetadata } from "@thestarweb/star-framework-utils";
import {
	AnyParamType,
	ArrayParamType,
	ObjectParamType,
	ParamType,
} from "./types.js";
import { mergeType, toParamType } from "./type-helper.js";
import { buildType } from "./type-build.js";

const mateKey = "$sf:param";

type RawParamMetadata<F, T> = Record<
	number,
	{ from: F; path?: string; exMeta?: T }
>;

export enum RootParamType {
	Any,
	Object,
	Single,
	SingleObject,
	// TODO 需要支持这种
	SingleArray,
}
type ObjectableRootParamType =
	| RootParamType.Any
	| RootParamType.Object
	| RootParamType.SingleObject;

function isObjectableRootParamType(type: RootParamType) {
	return [
		RootParamType.Any,
		RootParamType.Object,
		RootParamType.SingleObject,
	].includes(type);
}
function isMustObjectRootParamType(type: RootParamType) {
	return [RootParamType.Object, RootParamType.SingleObject].includes(type);
}
type ObjectableParamSwitch<
	T extends RootParamType,
	S,
	O,
> = T extends ObjectableRootParamType ? S : O;
function ObjectableParamSwitch<T extends RootParamType, O, S>(
	t: RootParamType,
	o: O,
	s: S,
): ObjectableParamSwitch<T, O, S> {
	if (isObjectableRootParamType(t)) {
		return o as any;
	}
	return s as any;
}

type TypeSwitch<
	T extends RootParamType,
	R extends Partial<Record<RootParamType, any>>,
	D = never,
> = T extends keyof R ? R[T] : D;

export class ParamMetaHelper<
	T extends { readonly [k: string]: RootParamType },
	ET = never,
> {
	constructor(
		public readonly namespase: string,
		private readonly paramConfig: T,
	) {}
	withExMetaType<ET>() {
		return this as any as ParamMetaHelper<T, ET>;
	}
	createParam(
		from: keyof T,
		target: object,
		propertyKey: PropertyKey | undefined,
		index: number,
		path?: string,
		exMeta?: ET,
	) {
		const meta = initMetadata(target, mateKey, propertyKey);
		if (!meta[this.namespase]) meta[this.namespase] = Object.create(null);
		meta[this.namespase][index] = {
			from,
			path,
			exMeta,
		};
	}
	createDecorator<F extends keyof T>(
		from: F,
	): (
		...arg: ObjectableParamSwitch<T[F], [path?: string, meta?: ET], [meta?: ET]>
	) => ParameterDecorator;
	createDecorator<
		F extends keyof T,
		P extends (...prop: any[]) => { path?: string; exMeta?: ET },
	>(from: F, p: P): (...arg: Parameters<P>) => ParameterDecorator;
	createDecorator<
		F extends keyof T,
		P extends (...prop: any[]) => {
			path?: ObjectableParamSwitch<T[F], string, never>;
			exMeta?: ET;
		},
	>(from: F, p?: P) {
		const _this = this;
		return function (...arg: Parameters<P>): ParameterDecorator {
			const { path, exMeta } = p
				? p(...arg)
				: ObjectableParamSwitch(
						_this.paramConfig[from],
						{ path: arg[0], exMeta: arg[1] },
						{ path: undefined, exMeta: arg[0] },
					);
			return function (target, propertyKey, index) {
				_this.createParam(from, target, propertyKey, index, path, exMeta);
			};
		};
	}

	getRawParamMetadata(
		target: object,
		propertyKey: PropertyKey,
	): RawParamMetadata<keyof T, ET> {
		return getMetadata(target, mateKey, propertyKey)?.[this.namespase] || {};
	}

	getParamMetadata(
		target: object,
		propertyKey: PropertyKey,
		{
			autoAddPath = true,
			autoParam,
			isDIInject,
		}: {
			/**
			 * 如果某个参数一定是object，但是解析的不是object且未提供path，则用参数名字作为path
			 * @default true
			 */
			autoAddPath?: boolean;
			autoParam?: {
				[K in keyof T]: T[K] extends ObjectableRootParamType ? K : never;
			}[keyof T];
			// TODO 如何和DI协调工作？
			isDIInject?: (object: object, key: PropertyKey, index: number) => boolean;
		} = {},
	) {
		const rawMeta = this.getRawParamMetadata(target, propertyKey);
		const meta: Partial<
			Record<keyof T, { type: ParamType; required: boolean }>
		> = {};
		const objType = typeOf<typeof target>() as TypeClass;
		const fnType = objType.types.find(
			(i) => i.kind === ReflectionKind.method && i.name === propertyKey,
		) as TypeMethod | undefined;
		if (!fnType) {
			throw new Error(
				`cannot find type info for ${Object.getPrototypeOf(target).constructor}.${String(propertyKey)}`,
			);
		}
		fnType.parameters.forEach((p, index) => {
			let paramRawMeta = rawMeta[index];
			if (!paramRawMeta) {
				if (isDIInject?.(target, propertyKey, index)) {
					// 这将由DI注入
					return;
				}
				if (autoParam) {
					paramRawMeta = { from: autoParam };
				} else {
					throw new Error(
						`unknow param from ${Object.getPrototypeOf(target).constructor}.${String(propertyKey)} index ${index}`,
					);
				}
			}
			if (!meta[paramRawMeta.from]) {
				meta[paramRawMeta.from] = {
					type: { type: "any" },
					required: false,
				};
			}
			const path = `${target.constructor.name}.${String(propertyKey)}.param.${index}`;
			const currentType = toParamType(p.type, path, p, p.optional);

			const fromType = this.paramConfig[paramRawMeta.from];
			if (
				isMustObjectRootParamType(fromType) &&
				currentType.type !== "object" &&
				!paramRawMeta.path
			) {
				paramRawMeta.path = p.name;
			}
			meta[paramRawMeta.from]!.type = mergeType(
				meta[paramRawMeta.from]!.type,
				currentType,
				path,
				paramRawMeta.path,
				!p.optional,
			);
			meta[paramRawMeta.from]!.required ||= !p.optional;
		});
		return {
			types: meta as {
				[K in keyof T]?: {
					type: TypeSwitch<
						T[K],
						{
							[RootParamType.Object]: ObjectParamType<ET>;
							[RootParamType.SingleObject]: ObjectParamType<ET>;
							[RootParamType.SingleArray]: ArrayParamType<ET>;
						},
						ParamType<ET>
					>;
					required: boolean;
				};
			},
			params: fnType.parameters.map((p, index) => {
				return {
					raw: p,
					...rawMeta[index],
				};
			}),
		};
	}
	async call(
		target: object,
		propertyKey: PropertyKey,
		param: Record<keyof T, any>,
	) {
		const meta = this.getParamMetadata(target, propertyKey);
		const pausedParam: any = {};
		Object.keys(meta.types).forEach((from) => {
			const { type, required } = meta.types[from]!;
			if (typeof param[from] != undefined) {
				pausedParam[from] = buildType(type, param[from], undefined, from);
			} else {
				if (required) throw new Error(`${from} is required`);
			}
		});
		const prop = meta.params.map((meta) => {
			const t = pausedParam[meta.from];
			if (meta.path) {
				return t[meta.path];
			}
			return t;
		});
		return (target as any)[propertyKey](...prop);
	}
}
