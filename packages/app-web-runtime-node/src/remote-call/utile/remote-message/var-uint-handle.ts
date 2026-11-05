import { ValueHandle } from "./value-handle.js";

const map = [0x80, 0x4000, 0x200000, 0x10000000, 0x800000000];
export const VarUIntHandle: ValueHandle<number> = {
	build(value) {
		let i = 0;
		while (map[i] < value) i++;
		const length = i + 1;
		return {
			length,
			fill(builder) {
				let v = value;
				while (v > 0x7f) {
					builder.write((v & 0x7f) | 0x80);
					v >>= 7;
				}
				builder.write(v);
			},
		};
	},
	read: function (reader) {
		let value: number;
		let res = 0;
		let i = 0;
		do {
			value = reader.arr[reader.pos++];
			res += (value & 0x7f) << i;
			i += 7;
		} while (value & 0x80);
		return res;
	},
};
