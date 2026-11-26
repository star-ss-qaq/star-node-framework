import { Method } from "../route/types.js";
import { Prop, SFWebRequest } from "./types.js";
import { AllApi } from "@thestarweb/star-framework-app-web";

export class BrowserSideRequest extends SFWebRequest<Pick<AllApi, "self">> {
	constructor(public readonly baseUrl: string = "/") {
		super();
	}
	protected async handleInnerCall(
		app: string,
		method: Method,
		url: URL,
		signal: AbortSignal,
		prop: Prop,
	) {
		if (app === "self") {
			return fetch(
				new URL(
					this.baseUrl + url.pathname.substring(1) + url.search,
					location.origin,
				),
				{
					...prop,
					headers: prop.header,
					//@ts-ignore
					duplex: "half",
					method,
					signal,
				},
			);
		}
		throw new Error("当前仅支持self访问本程序");
	}
}
