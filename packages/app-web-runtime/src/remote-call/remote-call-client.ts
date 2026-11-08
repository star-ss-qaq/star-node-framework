import { Readable } from "node:stream";
import type {
	RequestContext,
	RequestProp,
	ResponseData,
	ServerInstance,
} from "../types/index.js";
import { MessageType, MethodCodeToMethod, MethodToCode } from "./const.js";
import { createMessage, readMessage } from "./utile/remote-message/message.js";
import { WritableStream } from "node:stream/web";

interface IConnection {
	readable: ReadableStream<Uint8Array>;
	writable: WritableStream<Uint8Array>;
}

export abstract class RemoteCallClient {
	async onConnection({ readable, writable }: IConnection) {
		try {
			const reader = readable.getReader();
			const requestHeader = await reader.read();
			reader.releaseLock();
			if (!requestHeader.value) {
				return;
			}
			// new ReadableStream({
			// 	pull: async (ctrl) => {
			// 		const res = await reader.read();
			// 		if (res.value) {
			// 			ctrl.enqueue(res.value);
			// 		}
			// 		if (res.done) {
			// 			ctrl.close();
			// 		}
			// 	},
			// });
			const header = readMessage(MessageType.NewRequest, requestHeader.value);
			const data = await this.handleRequest({
				...header,
				url: new URL(header.path),
				method: MethodCodeToMethod[header.methodCode],
				body: readable,
			});
			const writer = writable.getWriter();
			await writer.write(createMessage(MessageType.StartResponse, data));
			if (data.res) {
				writer.releaseLock();
				(data.res instanceof Readable
					? Readable.toWeb(data.res)
					: data.res
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

	async onRequest({ method, url, header, context, body }: RequestProp) {
		const { readable, writable } = await this.createConnection();
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
			res: readable,
		};
	}
}
