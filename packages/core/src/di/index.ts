import { DIContainer } from "./container";
import { typeOf, isCustomTypeClass, is } from "@deepkit/type";

export async function diCreate<T>(module: { new (...args: any[]): T }) {
	const type = typeOf<typeof module>();
	if (!isCustomTypeClass(type)) {
		throw new Error(
			`The provided module is not a valid class type.${type.kind}`,
		);
	}
	const container = new DIContainer(module);
	return await container.resolve<T>(module);
}
export { DIContainer };
export { Inject } from "./@inject";
export { Module } from "./@module";
export * from "./provider";
