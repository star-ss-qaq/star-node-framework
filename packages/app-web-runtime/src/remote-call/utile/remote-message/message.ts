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
	[MessageType.NewRequest]: [
		{ name: "methodCode" as const, handle: UInt8Handle },
		{ name: "path" as const, handle: VarCharHandle },
		{ name: "header" as const, handle: JSONHandle },
		{ name: "context" as const, handle: JSONHandle },
	],
	[MessageType.StartResponse]: [
		{ name: "code" as const, handle: VarUIntHandle },
		{ name: "header" as const, handle: JSONHandle },
	],
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
	v: MessageDataType<T>,
) {
	const config = AllTypes[type];
	return buildMessage(
		config.map((i) => [(v as any)[i.name], i.handle] as const),
	);
}

export function readMessage<T extends MessageType>(
	type: T,
	message: Uint8Array,
): MessageDataType<T> {
	const reader = new Reader(message);
	const data: any = {};
	AllTypes[type]?.forEach((i) => {
		data[i.name] = i.handle.read(reader);
	});
	return data;
}
