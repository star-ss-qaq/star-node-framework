import { Readable } from "stream";
import { RequestContext, RequestProp, ResponseData } from "./resolved.js";

export interface ServerInstance {
	onRequest: (
		method: string,
		url: string | URL,
		header: any,
		body: ReadableStream<Uint8Array>,
		context: RequestContext,
	) => Promise<ResponseData | undefined>;
}
