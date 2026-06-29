import { Provider } from "./provider";

const moduleFlag = "$sf:mopdule";
export interface ModuleMeta {
	providers?: Provider[];
}
export function Module(moduleMeta: ModuleMeta = {}): ClassDecorator {
	return function (target) {
		Object.defineProperty(target, moduleFlag, {
			value: moduleMeta,
			enumerable: false,
		});
	};
}
export function getModuleMetadata(module: any) {
	return module[moduleFlag] as ModuleMeta;
}
