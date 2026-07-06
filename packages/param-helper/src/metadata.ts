import { ReflectionKind, TypeClass, TypeMethod, typeOf } from "@deepkit/type";
import { initMetadata } from "@thestarweb/star-framework-utils";
import { AnyParamType, ParamType } from "./types.js";
import { mergeType, toParamType } from "./type-helper.js";

const mateKey = "$sf:param";

export function createParam(
	namespase: string,
	from: string,
	target: object,
	propertyKey: string | symbol,
	index: number,
	path?: string,
	exMeta?: any,
) {
	const meta = initMetadata(target, mateKey, propertyKey);
	if (!meta[namespase]) meta[namespase] = Object.create(null);
	meta[namespase][index] = {
		from,
		path,
		exMeta,
	};
}

export function createParamDecorator<P extends string | never = string>(
	namespase: string,
	from: string,
) {
	return function (path?: P): ParameterDecorator {
		return function (target, propertyKey, index) {
			createParam(namespase, from, target, propertyKey || "", index, path);
		};
	};
}

type RawParamMetadata<F, T> = Record<
	number,
	{ from: F; path: string; exMeta?: T }
>;

function getRawParamMetadata<F, T>(
	namespase: string,
	target: object,
	propertyKey: PropertyKey,
): RawParamMetadata<F, T> {
	return initMetadata(target, mateKey, propertyKey)[namespase] || {};
}

export function getParamMetadata<T = any>(
	namespase: string,
	target: object,
	propertyKey: PropertyKey,
) {
	const rawMeta = getRawParamMetadata<any, T>(namespase, target, propertyKey);
	const meta: Record<string, { type: ParamType; required: boolean }> = {};
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
		const paramRawMeta = rawMeta[index];
		if (!paramRawMeta) {
			throw new Error(
				`unknow param from ${Object.getPrototypeOf(target).constructor}.${String(propertyKey)} index ${index}`,
			);
		}
		if (!meta[paramRawMeta.from]) {
			meta[paramRawMeta.from] = {
				type: { type: "any" },
				required: false,
			};
		}
		const path = `${target.constructor.name}.${String(propertyKey)}.param.${index}`;
		meta[paramRawMeta.from].type = mergeType(
			meta[paramRawMeta.from].type,
			toParamType(p.type, path, p.default, p.optional),
			path,
			paramRawMeta.path,
			!p.optional,
		);
		meta[paramRawMeta.from].required ||= !p.optional;
	});
	return {
		meta,
		params: fnType.parameters.map((p, index) => {
			return {
				raw: p,
				...rawMeta[index],
			};
		}),
	};
}

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
function isMustRootParamType(type: RootParamType) {
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

export class ParamMeta<
	T extends { readonly [k: string]: RootParamType },
	ET = any,
> {
	constructor(
		public readonly namespase: string,
		private readonly paramConfig: T,
	) {}
	withExMetaType<ET>() {
		return this as any as ParamMeta<T, ET>;
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

	getParamMetadata(target: object, propertyKey: PropertyKey) {
		const rawMeta = getRawParamMetadata<keyof T, ET>(
			this.namespase,
			target,
			propertyKey,
		);
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
			const paramRawMeta = rawMeta[index];
			if (!paramRawMeta) {
				throw new Error(
					`unknow param from ${Object.getPrototypeOf(target).constructor}.${String(propertyKey)} index ${index}`,
				);
			}
			if (!meta[paramRawMeta.from]) {
				meta[paramRawMeta.from] = {
					type: { type: "any" },
					required: false,
				};
			}
			const path = `${target.constructor.name}.${String(propertyKey)}.param.${index}`;
			meta[paramRawMeta.from]!.type = mergeType(
				meta[paramRawMeta.from]!.type,
				toParamType(p.type, path, p.default, p.optional),
				path,
				paramRawMeta.path,
				!p.optional,
			);
			meta[paramRawMeta.from]!.required ||= !p.optional;
		});
		return {
			meta,
			params: fnType.parameters.map((p, index) => {
				return {
					raw: p,
					...rawMeta[index],
				};
			}),
		};
	}
}
