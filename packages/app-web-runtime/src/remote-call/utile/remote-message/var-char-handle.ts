import { Buffer } from "node:buffer";
import { ValueHandle } from "./value-handle.js";
import { VarUIntHandle } from "./var-uint-handle.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
export const VarCharHandle: ValueHandle<string> = {
	build(value) {
		let strLength = Buffer.byteLength(value, "utf-8");
		const lFlag = VarUIntHandle.build(strLength);
		const length = lFlag.length + strLength;
		return {
			length,
			fill(builder) {
				lFlag.fill(builder);
				builder.buff.write(value, builder.offset, strLength, "utf-8");
				builder.offset += strLength;
			},
		};
	},
	read: function (reader) {
		const length = VarUIntHandle.read(reader);
		const end = reader.pos + length;
		const text = decoder.decode(reader.arr.subarray(reader.pos, end));
		reader.pos = end;
		return text;
	},
};
