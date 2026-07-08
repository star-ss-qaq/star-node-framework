import { ReflectionKind, Type, TypeClass, typeOf } from "@deepkit/type";
import {
	ParamMetaHelper,
	RootParamType,
} from "@thestarweb/star-framework-param-helper";

const argNamespase = "$sf:cli";

const paramHelper = new ParamMetaHelper("$sf:cli", {
	interaction: RootParamType.SingleObject,
	options: RootParamType.SingleObject,
	arg: RootParamType.SingleArray,
});

export const Interaction = paramHelper.createDecorator("interaction");

export const Options = paramHelper.createDecorator("options");

export const Arg = paramHelper.createDecorator("arg");

export function getParam(obj: object, key: PropertyKey) {
	return paramHelper.getParamMetadata(obj, key, {
		autoAddPath: true,
		autoParam: "options",
	});
}

export async function callWhithParam(
	...arg: Parameters<(typeof paramHelper)["call"]>
) {
	await paramHelper.call(...arg);
}
