import {
	RequestProp,
	ResponseData,
	ServerInstance,
} from "@thestarweb/star-framework-web-runtime";
import { Method } from "../route/types.js";
import { Prop, SFWebRequest } from "./types.js";

const textEncoder = new TextEncoder();

export class ServerSideRequest extends SFWebRequest {
	constructor(
		private serverIns: ServerInstance,
		private innerCall: (prop: RequestProp) => Promise<ResponseData>,
	) {
		super();
	}
	protected async handleInnerCall(
		app: string,
		method: Method,
		url: URL,
		signal: AbortSignal | undefined,
		prop: Prop,
	) {
		const res = await (
			app === "self" ? this.serverIns.onRequest : this.innerCall
		)({
			method,
			url,
			header: prop.header || {},
			context: {},
			appName: app,
			body: new ReadableStream({
				start(ctrl) {
					if (prop.body) {
						ctrl.enqueue(textEncoder.encode(prop.body));
					}
					ctrl.close();
				},
			}),
			signal: signal || new AbortController().signal,
			ip: '127.0.0.1',
			port: 0,
		});
		const reader = res.data?.getReader();
		return new Response(
			new ReadableStream({
				async pull(ctrl) {
					if (!reader) ctrl.close();
					const res = await reader!.read();
					if (res.value) ctrl.enqueue(res.value);
					if (res.done) ctrl.close();
				},
			}),
			{ status: res.code, headers: res.header },
		);
	}
}
