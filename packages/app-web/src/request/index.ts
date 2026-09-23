interface Prop {
	body?: any;
	query?: any;
	header?: Record<string, string>;
	param?: any;
}
type APIType = Record<Method, { [k: string]: { prop: Prop; return: any } }>;
declare module "@thestarweb/star-framework-app-web" {
	interface ProjectApi extends APIType {}
}
import { ProjectApi } from "@thestarweb/star-framework-app-web";
import { Method } from "../route/types.js";
import { stringify } from "qs";

export class SFWebRequest<API extends APIType = ProjectApi> {
	constructor(public readonly baseUrl: string = "/") {}
	private async _request(
		method: Method,
		path: string,
		prop: Prop,
	): Promise<any> {
		let url = path.startsWith("self:")
			? path.replace(/^self:\//, this.baseUrl)
			: path;
		if (prop.query) {
			url += stringify(prop.query);
		}
		const res = await fetch(url, {
			method,
			body: JSON.stringify(prop.body),
			headers: { "content-type": "application/json", ...prop.header },
		});
		if (!res.ok) {
			throw new Error("request fail");
		}
		if (res.headers.get("content-type") === "application/json") {
			return await res.json();
		}
		return res;
	}
	async get<P extends string & keyof API["GET"]>(
		path: `self:${P}`,
		prop: API["GET"][P]["prop"],
	): Promise<API["GET"][P]["return"]> {
		return await this._request("GET", path as string, prop);
	}
	async post<P extends keyof ProjectApi["POST"]>(
		path: `self:${P}`,
		prop: API["POST"][P]["prop"],
	): Promise<API["POST"][P]["return"]> {
		return await this._request("POST", path as string, prop);
	}
	async put<P extends keyof ProjectApi["PUT"]>(
		path: `self:${P}`,
		prop: API["PUT"][P]["prop"],
	): Promise<API["PUT"][P]["return"]> {
		return await this._request("PUT", path as string, prop);
	}
	async delete<P extends keyof ProjectApi["DELETE"]>(
		path: `self:${P}`,
		prop: API["DELETE"][P]["prop"],
	): Promise<API["DELETE"][P]["return"]> {
		return await this._request("PUT", path as string, prop);
	}
}
