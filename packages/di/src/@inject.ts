import {
	typeOf,
	TypeClass,
	isCustomTypeClass,
	ReflectionKind,
	TypeMethod,
	Type,
	TypeProperty,
	TypeFunction,
} from "@deepkit/type";
import { getMetadata, initMetadata } from "@thestarweb/star-framework-utils";

const injectFlag = "$sf:inject";
export function Inject(token?: any): ParameterDecorator & PropertyDecorator {
	return function (
		target: any,
		propertyKey: string | symbol | undefined,
		parameterIndex?: number,
	) {
		if (typeof parameterIndex === "number") {
			if (propertyKey) {
				initMetadata(target[propertyKey], injectFlag)[parameterIndex] = token;
			} else {
				initMetadata(target, injectFlag)[parameterIndex] = token;
			}
		} else if (propertyKey) {
			const data = initMetadata(target, injectFlag);
			if (!data.propertyInject) {
				data.propertyInject = Object.create(null);
			}
			data.propertyInject[propertyKey] = token;
		}
	};
}

export interface InjectInfo {
	token: any;
	required: boolean;
}

export function getClassConstructorInjectTokens<
	T extends new (...args: any[]) => any,
>(target: T): InjectInfo[] {
	const tokens: InjectInfo[] = [];
	const type = typeOf<T>() as TypeClass;
	const metadata = getMetadata(
		target,
		injectFlag,
		undefined,
		Object.create(null),
	);
	const t = type.types.find(
		(type) =>
			type.kind === ReflectionKind.method && type.name === "constructor",
	) as TypeMethod;
	t?.parameters?.forEach((arg, index) => {
		let token = null;
		if (metadata[index]) {
			token = metadata[index];
		} else if (isCustomTypeClass(arg.type)) {
			token = arg.type.classType;
		}
		tokens.push({ required: !arg.optional, token: token });
	});
	return tokens;
}
export function getClassPropertyInjectTokens<
	T extends new (...args: any[]) => {} | {},
>(target: T) {
	let obj = typeof target === "function" ? target.prototype : target;
	const tokens: Record<string | symbol, InjectInfo> = {};
	const type = typeOf<T>() as TypeClass;
	const typeMap = new Map<string | number | symbol, TypeProperty>();
	type.types.forEach((t) => {
		if (t.kind === ReflectionKind.property) {
			typeMap.set(t.name, t);
		}
	});
	while (obj) {
		const inj = getMetadata(obj, injectFlag)?.propertyInject;
		if (inj) {
			Object.getOwnPropertyNames(inj).forEach((key) => {
				if (typeMap.has(key)) {
					const fType = typeMap.get(key)!;
					let token = inj[key];
					if (typeof token === "undefined") {
						if (isCustomTypeClass(fType.type)) {
							token = fType.type.classType;
						} else {
							console.warn(
								`Cannot resolve dependency for property: ${key} in class ${type.classType.name}. The type is not a class type.`,
							);
							token = null;
						}
					}
					tokens[key] = { required: !fType.optional, token };
				}
			});
		}
		obj = Object.getPrototypeOf(obj);
	}
	return tokens;
}

export function getFunctinInjectTokens(
	fn: (...arg: any) => any,
	inject?: any[],
): InjectInfo[] {
	const tokens: InjectInfo[] = [];
	const type = typeOf<typeof fn>() as TypeFunction;
	// TODO 这里有问题 不能这样写
	const metadata = (fn as any)[injectFlag] || {};
	type?.parameters?.forEach((arg, index) => {
		let token = null;
		if (metadata[index]) {
			token = metadata[index];
		} else if (inject?.[index]) {
			token = inject[index];
		} else if (isCustomTypeClass(arg.type)) {
			token = arg.type.classType;
		}
		tokens.push({ required: !arg.optional, token: token });
	});
	return tokens;
}
