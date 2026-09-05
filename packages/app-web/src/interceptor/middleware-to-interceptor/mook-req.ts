import { IncomingMessage } from "http";
import { IncomingHttpHeaders } from "node:http";
import { Readable } from "node:stream";
import { CallProp } from "../../server/types.js";

export class MookReq extends Readable implements IncomingMessage {
	constructor(req: CallProp) {
		super();
		this.headers = req.header;
		this.headersDistinct = req.header;
		this.rawHeaders = [];
		this.url = req.url.pathname + req.url.search;
		this.method = req.method;
	}
	aborted = false;
	httpVersion = "1.1";
	httpVersionMajor = 1;
	httpVersionMinor = 1;
	complete = false;
	connection = null as any;
	socket = null as any;
	headers: IncomingHttpHeaders;
	headersDistinct: NodeJS.Dict<string[]>;
	rawHeaders: string[];
	trailers: NodeJS.Dict<string> = {};
	trailersDistinct = {};
	rawTrailers = [];
	setTimeout(msecs: number, callback?: () => void): this {
		throw new Error("Method not implemented.");
	}
	signal: AbortSignal = null as any;
	method?: string | undefined;
	url?: string | undefined;
	statusCode?: number | undefined;
	statusMessage?: string | undefined;
}
