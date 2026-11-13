import { Readable } from "stream";
import { RequestContext, RequestProp, ResponseData } from "./resolved.js";

export interface ServerInstanceOld {
	onRequest: (
		method: string,
		url: string | URL,
		header: any,
		body: ReadableStream<Uint8Array>,
		context: RequestContext,
	) => Promise<ResponseData | undefined>;
}
export interface ServerInstance {
	onRequest: (requestProp: RequestProp) => Promise<ResponseData>;
}
