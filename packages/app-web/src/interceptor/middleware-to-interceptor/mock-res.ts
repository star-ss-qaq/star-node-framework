import { type OutgoingHttpHeaders } from "node:http";
import { ResponseWithMeta } from "../../return-types/response-with-meta.js";
import { type PipeOptions } from "node:stream";

export class MookRes {
	_transformStream = new TransformStream();
	_readable: ReadableStream;
	_writeable: WritableStreamDefaultWriter;

	statusCode = 404;
	statusMessage = "";
	strictContentLength = false;
	headers: Record<string, any> = {};
	assignSocket(socket: any): void {
		throw new Error("Method not implemented.");
	}
	detachSocket(socket: any): void {
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

	private readonly __sf_send: () => void;
	constructor(
		public req: any,
		callback: (res: ResponseWithMeta) => any,
	) {
		this._readable = this._transformStream.readable;
		this._writeable = this._transformStream.writable.getWriter();
		this.__sf_send = () => {
			if (!this.sendDate) {
				this.sendDate = true;
				callback(
					new ResponseWithMeta(this._transformStream.readable, {
						code: this.statusCode,
						header: this.getHeaders() as any,
					}),
				);
			}
		};
	}
	chunkedEncoding = false;
	shouldKeepAlive = true;
	useChunkedEncodingByDefault = false;
	sendDate = false;
	finishe = false;
	headersSent = false;
	connection = null;
	socket = null;
	setTimeout(msecs: number, callback?: () => void): this {
		throw new Error("Method not implemented.");
	}
	setHeader(name: string, value: number | string | readonly string[]) {
		this.headers[name] = value;
		return this;
	}
	setHeaders(
		headers: Headers | Map<string, number | string | readonly string[]>,
	): this {
		if (headers instanceof Map) {
			headers.forEach((value, key) => {
				this.setHeader(key, value);
			});
		} else {
			this.headers = {
				...this.headers,
				...headers,
			};
		}
		return this;
	}
	appendHeader(name: string, value: string | readonly string[]): this {
		if (!this.headers[name]) {
			this.headers[name] = value;
		} else {
			if (!Array.isArray(this.headers[name])) {
				this.headers[name] = [this.headers[name]];
			}
			this.headers[name].push(...(Array.isArray(value) ? value : [value]));
		}
		return this;
	}
	getHeader(name: string) {
		return this.headers[name];
	}
	getHeaders() {
		return this.headers;
	}
	getHeaderNames() {
		return Object.keys(this.headers);
	}
	hasHeader(name: string) {
		return name in this.headers;
	}
	removeHeader(name: string): void {
		delete this.headers[name];
	}
	addTrailers(headers: OutgoingHttpHeaders | ReadonlyArray<[string, string]>) {
		throw new Error("Method not implemented.");
	}
	flushHeaders(): void {
		throw new Error("Method not implemented.");
	}
	addListener(eventName: unknown, listener: unknown): this {
		throw new Error("Method not implemented.");
	}
	emit(eventName: unknown, ...args: unknown[]): boolean {
		throw new Error("Method not implemented.");
	}
	listenerCount(eventName: unknown, listener?: unknown): number {
		throw new Error("Method not implemented.");
	}
	listeners(eventName: unknown): any {
		throw new Error("Method not implemented.");
	}
	off(eventName: unknown, listener: unknown): this {
		throw new Error("Method not implemented.");
	}
	on(eventName: unknown, listener: unknown): this {
		throw new Error("Method not implemented.");
	}
	once(eventName: unknown, listener: unknown): this {
		throw new Error("Method not implemented.");
	}
	prependListener(eventName: unknown, listener: unknown): this {
		throw new Error("Method not implemented.");
	}
	prependOnceListener(eventName: unknown, listener: unknown): this {
		throw new Error("Method not implemented.");
	}
	rawListeners(eventName: unknown): any {
		throw new Error("Method not implemented.");
	}
	removeAllListeners(eventName?: unknown): this {
		throw new Error("Method not implemented.");
	}
	removeListener(eventName: unknown, listener: unknown): this {
		throw new Error("Method not implemented.");
	}
	writable = true;
	writableAborted = false;
	writableEnded = false;
	writableFinished = false;
	writableHighWaterMark = 16 * 1024;
	writableLength = 0;
	writableObjectMode = false;
	writableCorked = 0;
	destroyed = false;
	closed = false;
	errored = null;
	writableNeedDrain = false;
	_write(
		chunk: any,
		encoding: BufferEncoding,
		callback?: (error?: Error | null) => void,
	) {
		this.__sf_send();
		const p = this._writeable.write(
			typeof chunk === "string" ? Buffer.from(chunk, encoding) : chunk,
		);
		if (callback) {
			p.then(() => callback());
			p.catch((e) => callback(e));
		}
	}
	_writev?(
		chunks: { chunk: any; encoding: BufferEncoding }[],
		callback: (error?: Error | null) => void,
	): void {
		const p = chunks.reduce((p, { chunk, encoding }) => {
			return p.then(() => this._write(chunk, encoding));
		}, Promise.resolve());
		if (callback) {
			p.then(() => callback());
			p.catch((e) => callback(e));
		}
	}
	_construct?(callback: (error?: Error | null) => void): void {
		throw new Error("Method not implemented.");
	}
	_destroy(
		error: Error | null,
		callback: (error?: Error | null) => void,
	): void {
		throw new Error("Method not implemented.");
	}
	_final(callback: (error?: Error | null) => void): void {
		throw new Error("Method not implemented.");
	}
	_defaultEncoding: BufferEncoding = "utf-8";
	write(chunk: unknown, encoding?: any, callback?: any): boolean {
		if (typeof encoding === "function") {
			callback = encoding;
			encoding = undefined;
		}
		this._write(chunk, encoding || this._defaultEncoding, callback);
		return true;
	}
	setDefaultEncoding(encoding: BufferEncoding) {
		this._defaultEncoding = encoding;
		return this;
	}
	end(chunk?: unknown, encoding?: unknown, cb?: unknown) {
		this.writableEnded = true;
		this.writableFinished = true;
		if (typeof chunk !== "function") {
			this.write(chunk, encoding, cb);
		} else {
			this.__sf_send();
			chunk?.();
		}
		this._writeable.close();
		return this;
	}
	cork(): void {
		this.writableCorked++;
	}
	uncork(): void {
		this.writableCorked--;
	}
	destroy(error?: Error): this {
		return this;
	}
	async [Symbol.asyncDispose](): Promise<void> {}
	pipe<T extends NodeJS.WritableStream>(
		destination: T,
		options?: PipeOptions,
	): T {
		throw new Error("Method not implemented.");
	}
	eventNames(): (string | symbol)[] {
		throw new Error("Method not implemented.");
	}
	getMaxListeners(): number {
		throw new Error("Method not implemented.");
	}
	setMaxListeners(n: number): this {
		throw new Error("Method not implemented.");
	}
}
