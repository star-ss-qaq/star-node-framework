import { MessageType } from "../../const.js";
import { buildMessage } from "./build.js";
import { JSONHandle } from "./json-handle.js";
import { Reader } from "./reader.js";
import { UInt8ArrayHandle } from "./uint8-array-handle.js";
import { UInt8Handle } from "./uint8-handle.js";
import { ValueHandle } from "./value-handle.js";
import { VarCharHandle } from "./var-char-handle.js";
import { VarUIntHandle } from "./var-uint-handle.js";

const AllTypes = {
	[MessageType.MessageReceived]: [],
	[MessageType.MessageError]: [],
	[MessageType.NewRequest]: [
		{ name: "methodCode" as const, handle: UInt8Handle },
		{ name: "path" as const, handle: VarCharHandle },
		{ name: "header" as const, handle: JSONHandle },
		{ name: "context" as const, handle: JSONHandle },
	],
	[MessageType.RequestBodyData]: [
		{ name: "index"  as const, handle: VarUIntHandle },
		{ name: "data"  as const, handle: UInt8ArrayHandle },
	],
	[MessageType.RequestBodyEnd]: [],
	[MessageType.RequestCancel]: [],
	[MessageType.StartResponse]: [
		{ name: "code"  as const, handle: VarUIntHandle },
		{ name: "header" as const, handle: JSONHandle },
	],
	[MessageType.ResponseData]: [
		{ name: "index" as const, handle: VarUIntHandle },
		{ name: "data" as const, handle: UInt8ArrayHandle },
	],
	[MessageType.ResponseEnd]: [],
} satisfies Record<MessageType, { name: string; handle: ValueHandle<any> }[]>;
type A<T extends MessageType> = (typeof AllTypes)[T];

type MessageDataType<T extends MessageType> = {
	[k in keyof A<T>]: A<T>[k] extends {
		name: string;
		handle: ValueHandle<infer V>;
	}
		? { [name in A<T>[k]["name"]]: V }
		: never;
}[keyof A<T>];

export function createMessage<T extends MessageType>(
	type: T,
	id: string,
	v: MessageDataType<T>,
) {
	const config = AllTypes[type];
	return buildMessage([
		[id, VarCharHandle],
		[type, UInt8Handle],
		...config.map((i) => [(v as any)[i.name], i.handle] as const),
	]);
}

export type AnyMessageData = {
	[k in MessageType]: { type: k; id: string } & MessageDataType<k>;
}[MessageType];
export function readMessage(message: Uint8Array): AnyMessageData {
	const reader = new Reader(message);
	const id = VarCharHandle.read(reader);
	const type = UInt8Handle.read(reader) as MessageType;
	const data: any = { id, type };
	AllTypes[type]?.forEach((i) => {
		data[i.name] = i.handle.read(reader);
	});
	return data;
}
