import { ViteDevServer } from "vite";
import { Interceptor } from "../types.js";
import { createRequest, createResponse } from "node-mocks-http";
import { ServerResponse } from "http";
import { ResponseWithMeta } from "../../index.js";
import {
	OutgoingHttpHeaders,
	OutgoingHttpHeader,
	IncomingMessage,
	OutgoingMessageEventMap,
	IncomingMessageEventMap,
} from "node:http";
import { Socket } from "node:net";
import {
	Duplex,
	PipeOptions,
	Readable,
	ReadableIteratorOptions,
	ReadableOperatorOptions,
} from "node:stream";
import { Abortable } from "node:events";
import { ByteReadableStream } from "node:stream/iter";
import { WritableStream, TransformStream } from "node:stream/web";
import { MookReq } from "./mook-req.js";
import { MookRes } from "./mock-res.js";

export function middlewareToInterceptor(
	middleware: ViteDevServer["middlewares"],
): Interceptor {
	return (req, next) => {
		return new Promise((resolve, reject) => {
			try {
				const _req: IncomingMessage = new MookReq(req);
				middleware(_req, new MookRes(resolve), async () => {
					try {
						resolve(await next(req));
					} catch (e) {
						reject(e);
					}
				});
			} catch (e) {
				reject(e);
			}
		});
	};
}
