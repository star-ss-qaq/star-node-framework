import {
	ParamMetaHelper,
	RootParamType,
} from "@thestarweb/star-framework-param-helper";
export const paramMeta = new ParamMetaHelper("http", {
	body: RootParamType.Any,
	header: RootParamType.SingleObject,
	query: RootParamType.Any,
	param: RootParamType.SingleObject,
});
export const Body = paramMeta.createDecorator("body");
export const Header = paramMeta.createDecorator("header");
export const Query = paramMeta.createDecorator("query");
export const Param = paramMeta.createDecorator("param");
