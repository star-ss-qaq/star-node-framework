import { Readable } from "node:stream";
import type { RequestProp, ResponseData } from "../types/index.js";
import { MessageType, MethodCodeToMethod, MethodToCode } from "./const.js";
import { createMessage, readMessage } from "./utile/remote-message/message.js";
import { WritableStream } from "node:stream/web";

interface IConnection {
	readable: ReadableStream<Uint8Array>;
	writable: WritableStream<Uint8Array>;
	signal: AbortSignal;
	abort: () => void;
}

export abstract class RemoteCallClient {
	async onConnection({ readable, writable, signal }: IConnection) {
		try {
			const reader = readable.getReader();
			const requestHeader = await reader.read();
			reader.releaseLock();
			if (!requestHeader.value) {
				return;
			}
			const header = readMessage(MessageType.NewRequest, requestHeader.value);
			const data = await this.handleRequest({
				...header,
				url: new URL(header.path),
				method: MethodCodeToMethod[header.methodCode],
				body: readable,
				signal,
			}).catch((error) => {
				console.error("fail to handle request:", error);
				return { data: null, code: 500, header: {} };
			});
			const writer = writable.getWriter();
			await writer.write(createMessage(MessageType.StartResponse, data));
			if (data.data) {
				writer.releaseLock();
				(data.data instanceof Readable
					? Readable.toWeb(data.data)
					: data.data
				).pipeTo(writable);
			} else {
				writer.close();
			}
		} catch (e) {
			console.error(e);
		}
	}
	abstract handleRequest(prop: RequestProp): Promise<ResponseData>;
	abstract createConnection(): IConnection | Promise<IConnection>;

	async onRequest({ method, url, header, context, body, signal }: RequestProp) {
		const { readable, writable, abort } = await this.createConnection();
		signal.addEventListener("abort", (ev) => {
			abort();
		});
		const writer = writable.getWriter();
		await writer.write(
			createMessage(MessageType.NewRequest, {
				methodCode: MethodToCode[method],
				path: url.toString(),
				header,
				context,
			}),
		);
		writer.releaseLock();
		body.pipeTo(writable);
		const reader = readable.getReader();
		const responseHeader = await reader.read();
		if (!responseHeader.value) throw new Error("no response header return");
		reader.releaseLock();
		const message = readMessage(
			MessageType.StartResponse,
			responseHeader.value,
		);
		return {
			...message,
			data: readable,
		};
	}
}
