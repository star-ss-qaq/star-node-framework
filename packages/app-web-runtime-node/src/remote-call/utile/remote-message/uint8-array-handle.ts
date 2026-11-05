import { ValueHandle } from "./value-handle.js";
import { VarUIntHandle } from "./var-uint-handle.js";
export const UInt8ArrayHandle: ValueHandle<Uint8Array> = {
	build(value) {
		const lFlag = VarUIntHandle.build(value.length);
		const length = lFlag.length + value.length;
		return {
			length,
			fill(builder) {
				lFlag.fill(builder);
				builder.buff.set(value, builder.offset)
				builder.offset+=value.length;
			},
		};
	},
	read: function (reader) {
			const length = VarUIntHandle.read(reader);
			const end = reader.pos + length;
			const res = reader.arr.subarray(reader.pos, end)
			reader.pos = end;
			return res;
	},
};
