import {
	AllApi,
	ProjectApi,
	ResponseWithMeta,
} from "@thestarweb/star-framework-app-web";
import { Method } from "../route/types.js";
import { stringify } from "qs";
import { StringKeyOf } from "@thestarweb/ts-helper";

export interface Prop {
	body?: any;
	query?: any;
	header?: Record<string, string>;
	param?: any;
}
type APIType = Record<Method, { [k: string]: { prop: Prop; return: any } }>;

declare module "@thestarweb/star-framework-app-web" {
	interface ProjectApi extends APIType {}
	interface AllApi {
		self: ProjectApi;
	}
}
const textEncoder = new TextEncoder();
export abstract class SFWebRequest<
	All extends Record<keyof All, APIType> = AllApi,
> {
	constructor() {}
	protected abstract handleInnerCall(
		app: string,
		method: Method,
		url: URL,
		prop: Prop,
	): Promise<Response>;
	private async _request(
		method: Method,
		path: string,
		prop: Prop,
	): Promise<any> {
		const url = new URL(path);
		if (!prop.header) prop.header = {};
		if (!prop.header["content-type"])
			prop.header["content-type"] = "application/json";
		const body = JSON.stringify(prop.body);
		const data = await (url.protocol === "https" || url.protocol === "http"
			? fetch(url, {
					...prop,
					body,
				})
			: this.handleInnerCall(
					url.protocol.substring(0, url.protocol.length - 1),
					method,
					url,
					{ ...prop, body },
				));
		if (!data.ok) throw new Error();
		return data.json();
	}

	async get<A extends StringKeyOf<All>, P extends StringKeyOf<All[A]["GET"]>>(
		path: `${A}:${P}`,
		prop: All[A]["GET"][P]["prop"],
	): Promise<All[A]["GET"][P]["return"]> {
		return await this._request("GET", path, prop);
	}
	async post<A extends StringKeyOf<All>, P extends StringKeyOf<All[A]["POST"]>>(
		path: `${A}:${P}`,
		prop: All[A]["POST"][P]["prop"],
	): Promise<All[A]["POST"][P]["return"]> {
		return await this._request("POST", path as string, prop);
	}
	async put<A extends StringKeyOf<All>, P extends StringKeyOf<All[A]["PUT"]>>(
		path: `${A}:${P}`,
		prop: All[A]["PUT"][P]["prop"],
	): Promise<All[A]["PUT"][P]["return"]> {
		return await this._request("PUT", path as string, prop);
	}
	async delete<
		A extends StringKeyOf<All>,
		P extends StringKeyOf<All[A]["DELETE"]>,
	>(
		path: `${A}:${P}`,
		prop: All[A]["DELETE"][P]["prop"],
	): Promise<All[A]["DELETE"][P]["return"]> {
		return await this._request("PUT", path as string, prop);
	}
}
