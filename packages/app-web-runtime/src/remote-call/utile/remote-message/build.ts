import { Buffer } from "node:buffer";
import { ValueHandle } from "./value-handle.js";

export type DataProp<T> = readonly [value: T, handle: ValueHandle<T>];

export class Builder {
	buff: Buffer;
	offset = 0;
	constructor(length: number) {
		this.buff = Buffer.alloc(length);
	}
	write(data: number) {
		this.buff[this.offset++] = data;
	}
}

export function buildMessage<T extends readonly DataProp<any>[]>(
	messageData: T,
) {
	const buildPre = messageData.map((i) => i[1].build(i[0]));
	const length = buildPre.reduce((acc, pre) => acc + pre.length, 0);
	// const message = new Uint8Array(length);
	const builder = new Builder(length);
	buildPre.forEach((i) => i.fill(builder));
	return builder.buff;
}
