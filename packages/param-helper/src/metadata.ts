import { ReflectionKind, TypeClass, TypeMethod, typeOf } from "@deepkit/type";
import { initMetadata } from "@thestarweb/star-framework-utils";
import { AnyParamType, ParamType } from "./types.js";
import { mergeType, toParamType } from "./type-helper.js";

const mateKey = "$sf:param";

export function createParam(
	from: string,
	target: object,
	propertyKey: string | symbol,
	index: number,
	path?: string,
) {
	initMetadata(initMetadata(target, mateKey), propertyKey || "")[index] = {
		from,
		path,
	};
}

export function createParamDecorator<P extends string | never = string>(
	from: string,
) {
	return function (path?: P): ParameterDecorator {
		return function (target, propertyKey, index) {
			createParam(from, target, propertyKey || "", index, path);
		};
	};
}

type RawParamMetadata = Record<number, { from: string; path: string }>;

function getRawParamMetadata(
	target: object,
	propertyKey: PropertyKey,
): RawParamMetadata {
	return initMetadata(initMetadata(target, mateKey), propertyKey);
}

export function getParamMetadata(target: object, propertyKey: PropertyKey) {
	const rawMeta = getRawParamMetadata(target, propertyKey);
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
	return { meta };
}
