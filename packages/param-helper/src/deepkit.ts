import {
	ReflectionKind,
	Type,
	TypeClass,
	TypeMethod,
	TypeObjectLiteral,
	typeOf,
} from "@deepkit/type";

export function isBaseType(type: Type) {
	return [
		ReflectionKind.string,
		ReflectionKind.number,
		ReflectionKind.boolean,
		ReflectionKind.enum,
	].includes(type.kind);
}

export function isSingleDeepkitType(type: Type, allowArray = true): boolean {
	if (isBaseType(type)) return true;
	if (allowArray && type.kind === ReflectionKind.array) {
		return isSingleDeepkitType(type.type, false);
	}
	if (type.kind === ReflectionKind.union) {
		return type.types.every((value) => isSingleDeepkitType(value, allowArray));
	}
	return false;
}

export function isObjectDeepkitType(
	type: Type,
): type is TypeClass | TypeObjectLiteral {
	return [ReflectionKind.class, ReflectionKind.objectLiteral].includes(
		type.kind,
	);
}

export function getClassDeepkitType(obj: object) {
	const type = typeOf<typeof obj>();
	if (type.kind !== ReflectionKind.class)
		throw new Error("this is not a class object");
	return type;
}

export function getClassMethodDeepkitType(
	type: TypeClass | object,
	name: string | symbol,
) {
	const classType =
		// 如果type已经是TypeClass，那么他是以null为原型的对象，
		// 如果是一个class的实例，那么Object.getPrototypeOf(type)会返回class.prototype
		// 如果是class.prototype，则Object.getOwnPropertyDescriptor(type, "constructor")会返回构造函数
		!Object.getOwnPropertyDescriptor(type, "constructor") &&
		Object.getPrototypeOf(type) === null &&
		(type as TypeClass).kind === ReflectionKind.class
			? (type as TypeClass)
			: getClassDeepkitType(type);
	return classType.types.find(
		(i) => i.kind === ReflectionKind.method && i.name == name,
	) as TypeMethod | undefined;
}
