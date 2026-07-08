import { getMetadata, initMetadata } from "@thestarweb/star-framework-utils";

const metaKey = "$sf:cli-command";

export enum Type {
	fn,
	set,
}
interface MetaItemInfo {
	propertyKey: string | symbol;
	desc?: string;
	type: Type;
}
type MetaData = Record<string, MetaItemInfo>;

export function Command(command: string = "", desc?: string): MethodDecorator {
	return function (target, propertyKey) {
		initMetadata<MetaData>(target, metaKey)[command] = {
			propertyKey,
			desc,
			type: Type.fn,
		};
	};
}
export function CommandSet(
	command: string = "",
	desc?: string,
): PropertyDecorator {
	return function (target, propertyKey) {
		initMetadata<MetaData>(target, metaKey)[command] = {
			propertyKey,
			desc,
			type: Type.set,
		};
	};
}

export function getCommands(obj: object) {
	return getMetadata<MetaData>(obj, metaKey);
}
