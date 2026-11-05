import { Buffer } from "node:buffer";
import { ValueHandle } from "./value-handle.js";
import { VarUIntHandle } from "./var-uint-handle.js";
import { VarCharHandle } from "./var-char-handle.js";

export const JSONHandle: ValueHandle<any> = {
	build(value) {
		const v = JSON.stringify(value);
		return VarCharHandle.build(v);
	},
	read: function (reader) {
		return JSON.parse(VarCharHandle.read(reader));
	},
};
