import {
	AllApi,
	ProjectApi,
	ResponseWithMeta,
} from "@thestarweb/star-framework-app-web";
import { Method } from "../route/types.js";
import { stringify } from "qs";
import { StringKeyOf } from "@thestarweb/ts-helper";
import {
	getRequestAbortSignal,
	mergeAbortSignal,
} from "../abort-signal/index.js";

export interface UserConfig {
	signal?: AbortSignal;
	/**
	 * 默认请求在离开页面（对于前端）或接口响应结束（对于后端）时会取消请求，如果需要保持请求则需要将其设置为true
	 */
	keepRequest?: boolean;
}
export interface UserProp extends UserConfig {
	body?: string;
	query?: any;
	header?: Record<string, string>;
	param?: any;
}
export interface Prop {
	body?: any;
	query?: any;
	header?: Record<string, string>;
	param?: any;
}
interface ApiDefine {
	prop: Prop;
	return: any;
}
interface ApisDefine {
	[k: string]: ApiDefine;
}
type APIType = Partial<Record<Method, ApisDefine>>;

declare module "@thestarweb/star-framework-app-web" {
	interface ProjectApi extends APIType {}
	interface AllApi {
		self: ProjectApi;
	}
}
type AllUrl<Root extends Record<string, APIType>, M extends Method> = {
	[K1 in keyof Root & string]: {
		[K3 in keyof Root[K1][M] & string]: `${K1}:${K3}`;
	}[keyof Root[K1][M] & string];
}[keyof Root & string];
type UrlToProp<
	Root extends Record<string, APIType>,
	M extends Method,
	P extends string,
> = P extends `${infer K1}:${infer K3}`
	? K1 extends keyof Root
		? Root[K1] extends Record<M, infer C>
			? K3 extends keyof C
				? C[K3]
				: never
			: never
		: never
	: never;
export abstract class SFWebRequest<
	All extends Record<keyof All, Partial<APIType>> = AllApi,
> {
	constructor() {}
	protected abstract handleInnerCall(
		app: string,
		method: Method,
		url: URL,
		signal: AbortSignal | undefined,
		prop: Prop,
	): Promise<Response>;
	private async _request(
		method: Method,
		path: string,
		prop: UserProp,
	): Promise<any> {
		const url = new URL(path);
		if (!prop.header) prop.header = {};
		if (!prop.header["content-type"])
			prop.header["content-type"] = "application/json";
		const body = JSON.stringify(prop.body);
		let signal = prop.keepRequest ? undefined : getRequestAbortSignal();
		if (prop.signal)
			signal = signal ? mergeAbortSignal(signal, prop.signal) : prop.signal;
		const data = await (url.protocol === "https" || url.protocol === "http"
			? fetch(url, {
					...prop,
					body,
				})
			: this.handleInnerCall(
					url.protocol.substring(0, url.protocol.length - 1),
					method,
					url,
					signal,
					{ ...prop, body },
				));
		if (!data.ok) throw new Error();
		return data.json();
	}

	async get<P extends AllUrl<All, "GET">>(
		path: P,
		prop: UrlToProp<All, "GET", P>["prop"] & UserConfig,
	): Promise<UrlToProp<All, "GET", P>["return"]> {
		return await this._request("GET", path, prop);
	}
	async post<P extends AllUrl<All, "POST">>(
		path: P,
		prop: UrlToProp<All, "POST", P>["prop"] & UserConfig,
	): Promise<UrlToProp<All, "POST", P>["return"]> {
		return await this._request("POST", path as string, prop);
	}
	async put<P extends AllUrl<All, "PUT">>(
		path: P,
		prop: UrlToProp<All, "PUT", P>["prop"] & UserConfig,
	): Promise<UrlToProp<All, "PUT", P>["return"]> {
		return await this._request("PUT", path as string, prop);
	}
	async delete<P extends AllUrl<All, "DELETE">>(
		path: P,
		prop: UrlToProp<All, "DELETE", P>["prop"] & UserConfig,
	): Promise<UrlToProp<All, "DELETE", P>["return"]> {
		return await this._request("PUT", path as string, prop);
	}
}
