import { ValueHandle } from "./value-handle.js";
import { Reader } from "./reader.js";

export const UInt8Handle: ValueHandle<number> = {
	build(value) {
		return {
			length: 1,
			fill(builder) {
				builder.buff[builder.offset++] = value;
			},
		};
	},
	read(reader: Reader) {
		return reader.arr[reader.pos++];
	},
};
