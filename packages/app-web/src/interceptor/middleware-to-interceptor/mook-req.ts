import { IncomingHttpHeaders } from "node:http";
import {
	Duplex,
	PipeOptions,
	Readable,
	ReadableIteratorOptions,
	ReadableOperatorOptions,
} from "node:stream";
import { CallProp } from "../../server/types.js";
import { Abortable } from "node:events";
import { ByteReadableStream } from "node:stream/iter";
import { WritableStream, TransformStream } from "node:stream/web";

export class MookReq {
	constructor(req: CallProp) {
		this.headers = req.header;
		this.headersDistinct = req.header;
		this.rawHeaders = [];
		this.url = req.url.pathname + req.url.search;
		this.method = req.method;
	}
	destroy(error?: Error): this {
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
	listeners(eventName: unknown) {
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
	rawListeners(eventName: unknown) {
		throw new Error("Method not implemented.");
	}
	removeAllListeners(eventName?: unknown): this {
		throw new Error("Method not implemented.");
	}
	removeListener(eventName: unknown, listener: unknown): this {
		throw new Error("Method not implemented.");
	}
	readableAborted = false;
	readable = false;
	readableDidRead = true;
	readableEncoding = null;
	readableEnded = true;
	readableFlowing = false;
	readableHighWaterMark = 16 * 1024;
	readableLength = 0;
	readableObjectMode = false;
	destroyed = false;
	closed = false;
	errored = null;
	_construct?(callback: (error?: Error | null) => void): void {
		throw new Error("Method not implemented.");
	}
	_read(size: number): void {
		throw new Error("Method not implemented.");
	}
	read(size?: number) {
		throw new Error("Method not implemented.");
	}
	setEncoding(encoding: BufferEncoding): this {
		throw new Error("Method not implemented.");
	}
	pause(): this {
		throw new Error("Method not implemented.");
	}
	resume(): this {
		throw new Error("Method not implemented.");
	}
	isPaused(): boolean {
		throw new Error("Method not implemented.");
	}
	unpipe(destination?: NodeJS.WritableStream): this {
		throw new Error("Method not implemented.");
	}
	unshift(chunk: any, encoding?: BufferEncoding): void {
		throw new Error("Method not implemented.");
	}
	wrap(stream: NodeJS.ReadableStream): this {
		throw new Error("Method not implemented.");
	}
	push(chunk: any, encoding?: BufferEncoding): boolean {
		throw new Error("Method not implemented.");
	}
	compose(
		stream:
			| NodeJS.WritableStream
			| WritableStream
			| TransformStream
			| ((source: any) => void),
		options?: Abortable,
	): Duplex {
		throw new Error("Method not implemented.");
	}
	iterator(options?: ReadableIteratorOptions): NodeJS.AsyncIterator<any> {
		throw new Error("Method not implemented.");
	}
	map(
		fn: (data: any, options?: Abortable) => any,
		options?: ReadableOperatorOptions,
	): Readable {
		throw new Error("Method not implemented.");
	}
	filter(
		fn: (data: any, options?: Abortable) => boolean | Promise<boolean>,
		options?: ReadableOperatorOptions,
	): Readable {
		throw new Error("Method not implemented.");
	}
	forEach(
		fn: (data: any, options?: Abortable) => void | Promise<void>,
		options?: Pick<ReadableOperatorOptions, "concurrency" | "signal">,
	): Promise<void> {
		throw new Error("Method not implemented.");
	}
	toArray(options?: Abortable): Promise<any[]> {
		throw new Error("Method not implemented.");
	}
	some(
		fn: (data: any, options?: Abortable) => boolean | Promise<boolean>,
		options?: Pick<ReadableOperatorOptions, "concurrency" | "signal">,
	): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	find(fn: unknown, options?: unknown) {
		throw new Error("Method not implemented.");
	}
	every(
		fn: (data: any, options?: Abortable) => boolean | Promise<boolean>,
		options?: Pick<ReadableOperatorOptions, "concurrency" | "signal">,
	): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	flatMap(
		fn: (data: any, options?: Abortable) => any,
		options?: Pick<ReadableOperatorOptions, "concurrency" | "signal">,
	): Readable {
		throw new Error("Method not implemented.");
	}
	drop(limit: number, options?: Abortable): Readable {
		throw new Error("Method not implemented.");
	}
	take(limit: number, options?: Abortable): Readable {
		throw new Error("Method not implemented.");
	}
	reduce(fn: unknown, initial?: unknown, options?: unknown): any {
		throw new Error("Method not implemented.");
	}
	_destroy(
		error: Error | null,
		callback: (error?: Error | null) => void,
	): void {
		throw new Error("Method not implemented.");
	}
	[Symbol.asyncIterator](): NodeJS.AsyncIterator<any> {
		throw new Error("Method not implemented.");
	}
	[Symbol.asyncDispose](): Promise<void> {
		throw new Error("Method not implemented.");
	}
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
