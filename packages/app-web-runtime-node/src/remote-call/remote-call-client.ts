import { Readable } from "node:stream";
import { RequestContext, ServerInstance } from "../type.js";
import { MessageType, MethodCodeToMethod, MethodToCode } from "./const.js";
import { buildMessage } from "./utile/remote-message/build.js";
import { VarCharHandle } from "./utile/remote-message/var-char-handle.js";
import { UInt8Handle } from "./utile/remote-message/uint8-handle.js";
import { Reader } from "./utile/remote-message/reader.js";
import { MessageBase } from "./meaage-base.js";
import { VarUIntHandle } from "./utile/remote-message/var-uint-handle.js";
import {
	AnyMessageData,
	createMessage,
	readMessage,
} from "./utile/remote-message/message.js";

export abstract class RemoteCallClient implements ServerInstance {
	readonly insId = Math.random().toString(16).substring(2, 6).padStart(4, "0");
	textEncoder = new TextEncoder();
	sendMap: Record<string, (message: AnyMessageData) => void> =
		Object.create(null);
	receiveMap: Record<string, (reader: AnyMessageData) => void> =
		Object.create(null);
	async warpSendBody(
		id: string,
		body: ReadableStream,
		messageBase: MessageBase,
		dataType: MessageType.RequestBodyData | MessageType.ResponseData,
		endType: MessageType.RequestBodyEnd | MessageType.ResponseEnd,
	) {
		const read = body.getReader();
		while (true) {
			const res = await read.read();
			let index = 0;
			if (res.value) {
				await messageBase.sendMessage(
					createMessage(dataType, id, {
						index: index++,
						data: res.value instanceof Uint8Array ? res.value : Buffer.from(res.value),
					}),
				);
			}
			if (res.done) {
				await messageBase.sendMessage(createMessage(endType, id, {}));
				break;
			}
		}
	}
	createWarpReadBody(
		writable: WritableStream,
		dataType: MessageType.RequestBodyData | MessageType.ResponseData,
		endType: MessageType.RequestBodyEnd | MessageType.ResponseEnd,
		messageBase: MessageBase,
		next: (data: AnyMessageData) => boolean = () => false,
	) {
		const writer = writable.getWriter();
		return (data: AnyMessageData) => {
			switch (data.type) {
				case dataType:
					writer.write(data.data);
					this.sendMessage(
						createMessage(MessageType.MessageReceived, data.id, {}),
					);
					break;
				case endType:
					writer.close();
					this.sendMessage(
						createMessage(MessageType.MessageReceived, data.id, {}),
					);
					break;
				case MessageType.MessageReceived:
					messageBase.messageSuccess();
					break;
				case MessageType.MessageError:
					console.error("存在协议错误的情况");
					break;
				default:
					if (next?.(data)) {
						this.sendMessage(
							createMessage(MessageType.MessageReceived, data.id, {}),
						);
					} else {
						this.sendMessage(
							createMessage(MessageType.MessageError, data.id, {}),
						);
					}
			}
		};
	}
	onMessage(message: Uint8Array) {
		const data = readMessage(message);
		const { id } = data;
		if (id.startsWith(this.insId)) {
			this.sendMap[id]?.(data);
		} else {
			if (this.receiveMap[id]) {
				this.receiveMap[id](data);
			}
			if (data.type == MessageType.NewRequest) {
				const messageBase = new MessageBase((mess) => this.sendMessage(mess));
				this.sendMessage(createMessage(MessageType.MessageReceived, id, {}));
				const { readable, writable } = new TransformStream();
				this.receiveMap[id] = this.createWarpReadBody(
					writable,
					MessageType.RequestBodyData,
					MessageType.RequestBodyEnd,
					messageBase,
				);

				this.handleRequest(
					MethodCodeToMethod[data.methodCode],
					data.path,
					data.header,
					readable,
					data.context,
				).then(async (res) => {
					await messageBase.sendMessage(
						createMessage(MessageType.StartResponse, id, res),
					);
					const body = res.res;
					if (body) {
						await this.warpSendBody(
							id,
							body instanceof Readable ? (Readable.toWeb(body) as any) : body,
							messageBase,
							MessageType.ResponseData,
							MessageType.ResponseEnd,
						);
					} else {
						await messageBase.sendMessage(
							createMessage(MessageType.ResponseEnd, id, res),
						);
					}
				});
				// .catch((e) => messageBase.sendMessage(createMessage(MessageType.)));
			}
		}
	}
	abstract sendMessage(message: Uint8Array): void;
	abstract handleRequest(
		method: string,
		url: string | URL,
		header: any,
		body: ReadableStream<Uint8Array>,
		context: RequestContext,
	): Promise<{
		code: number;
		header: any;
		res: Readable | ReadableStream | null;
	}>;
	onRequest(
		method: string,
		url: string | URL,
		header: any,
		body: ReadableStream<Uint8Array>,
		context: RequestContext,
	) {
		const id =
			this.insId +
			Date.now().toString(16).slice(-8) +
			Math.random().toString(16).substring(2, 6).padStart(4, "0");
		const { readable, writable } = new TransformStream();
		return new Promise<any>((resolve, reject) => {
			const messageBase = new MessageBase((mess) => this.sendMessage(mess));
			this.sendMap[id] = this.createWarpReadBody(
				writable,
				MessageType.ResponseData,
				MessageType.ResponseEnd,
				messageBase,
				(message) => {
					if (message.type === MessageType.StartResponse) {
						resolve({
							code: message.code,
							header: message.header,
							res: readable,
						});
						return true;
					}
					return false;
				},
			);
			(async () => {
				await messageBase.sendMessage(
					createMessage(MessageType.NewRequest, id, {
						methodCode: MethodToCode[method],
						path: url.toString(),
						header,
						context,
					}),
				);
				await this.warpSendBody(
					id,
					body,
					messageBase,
					MessageType.RequestBodyData,
					MessageType.RequestBodyEnd,
				);
			})();
		});
	}
}
