import { ServerInstance } from "@thestarweb/star-framework-web-runtime";
import { Method } from "../route/types.js";
import { Prop, SFWebRequest } from "./types.js";

const textEncoder = new TextEncoder();

export class ServerSideRequest extends SFWebRequest {
	constructor(private serverIns: ServerInstance) {
		super();
	}
	protected async handleInnerCall(
		app: string,
		method: Method,
		url: URL,
		prop: Prop,
	) {
		if (app === "self") {
			const res = await this.serverIns.onRequest({
				method,
				url,
				header: prop.header || {},
				context: {},
				body: new ReadableStream({
          start(ctrl){
            ctrl.enqueue(textEncoder.encode(prop.body))
            ctrl.close();
          }
        }),
			});
			return new Response(res.data, { status: res.code, headers: res.header });
		}
		throw new Error("Method not implemented.");
	}
}
