import { ValueHandle } from "./value-handle.js";

export class Reader {
	constructor(
		public arr: Uint8Array,
		public pos = 0,
	) {}
	static reader<T extends ValueHandle<any>[]>(
		arr: Uint8Array,
		handle: T,
		pos = 0,
	) {
    const reader = new Reader(arr,pos);
		return handle.map(i=> i.read(reader))
	}
}
