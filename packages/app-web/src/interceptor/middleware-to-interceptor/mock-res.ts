import { OutgoingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { ResponseWithMeta } from "../../return-types/response-with-meta.js";
// @side-only server
import { PassThrough } from "node:stream";

export class MookRes extends OutgoingMessage implements ServerResponse {
	constructor(callback: (res: ResponseWithMeta) => any) {
		super();
		["write", "end"].forEach((fn) => {
			this[fn as keyof this] = ((...prop: any[]) => {
				if (!this._passThrough) {
					this._passThrough = new PassThrough();
					callback(
						new ResponseWithMeta(this._passThrough, {
							code: this.statusCode,
							header: this.getHeaders() as any,
						}),
					);
				}
				return (this._passThrough[fn as keyof PassThrough] as any)(...prop);
			}) as any;
		});
	}
	statusCode = 404;
	statusMessage = "";
	strictContentLength = false;
	assignSocket(socket: Socket): void {
		throw new Error("Method not implemented.");
	}
	detachSocket(socket: Socket): void {
		throw new Error("Method not implemented.");
	}
	writeContinue(callback?: () => void): void {
		throw new Error("Method not implemented.");
	}
	writeEarlyHints(
		hints: Record<string, string | string[]>,
		callback?: () => void,
	): void {
		throw new Error("Method not implemented.");
	}
	writeHead(
		statusCode: unknown,
		statusMessage?: unknown,
		headers?: unknown,
	): this {
		throw new Error("Method not implemented.");
	}
	writeProcessing(callback?: () => void): void {
		throw new Error("Method not implemented.");
	}
	_passThrough: null | PassThrough = null;
}
