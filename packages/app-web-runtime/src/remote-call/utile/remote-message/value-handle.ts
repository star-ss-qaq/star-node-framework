import { Builder } from "./build.js";
import { Reader } from "./reader.js";

export interface ValueHandle<T> {
	build(value: T): {
		readonly length: number;
		fill(builder: Builder): void;
	};
	read(reader: Reader): T;
}
