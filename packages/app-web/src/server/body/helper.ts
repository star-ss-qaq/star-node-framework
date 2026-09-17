export class ReaderHelper {
	reader: ReadableStreamDefaultReader<Uint8Array>;
	constructor(rawStream: ReadableStream<Uint8Array>) {
		this.reader = rawStream.getReader();
	}
	buff: Uint8Array | null = null;
	done = false;
	totalIndex = 0;
	async _readFromRaw(errorOnEOF = true) {
		if (this.buff) {
			const { buff } = this;
			this.buff = null;
			return buff;
		}
		const res = await this.reader.read();
		if (res.done) {
			this.done = true;
			if (errorOnEOF) throw new Error("EOF");
		}
		return res.value!;
	}
	async streamReadUntil(read: (arr: Uint8Array) => number, errorOnEOF = true) {
		while (true) {
			const buff = await this._readFromRaw(errorOnEOF);
			if (!buff) return;
			const index = read(buff);
			if (index === 0) {
				this.buff = buff;
				return;
			} else if (index > 0 && index < buff.length) {
				this.buff = buff.subarray(index);
				return;
			} else if (index === buff.length) {
				this.buff = null;
				return;
			}
		}
	}
	async streamReadLength(
		length: number,
		callback: (block: Uint8Array) => void,
	) {
		return this.streamReadUntil((block) => {
			if (length <= block.length) {
				callback(block.subarray(0, length));
				return length;
			}
			callback(block);
			length -= block.length;
			return -1;
		});
	}
	async readAsABuff(length: number) {
		const res = new Uint8Array(length);
		let offset = 0;
		this.streamReadLength(length, (block) => {
			res.set(block, offset);
			offset += block.length;
		});
		return res;
	}
	async readAsString(length: number, decoder: TextDecoder) {
		const s: string[] = [];
		await this.streamReadLength(length, (block) => {
			s.push(decoder.decode(block, { stream: true }));
		});
		return s.join("");
	}
	async readChar() {
		let res = 0;
		await this.streamReadUntil((arr) => {
			if (arr.length > 0) {
				res = arr[0];
				return 1;
			}
			return -1;
		});
		return res;
	}
	async viewChar() {
		let res = 0;
		await this.streamReadUntil((arr) => {
			if (arr.length > 0) {
				res = arr[0];
				return 0;
			}
			return -1;
		});
		return res;
	}
	async skipChar(char: number[]) {
		await this.streamReadUntil((buff) => {
			for (let i = 0; i < buff.length; i++) {
				if (!char.includes(buff[i])) {
					return i;
				}
			}
			return -1;
		}, false);
	}
}
export function mergeUint8Array(data: Uint8Array[]) {
	const ret = new Uint8Array(data.reduce((size, a) => size + a.length, 0));
	let offset = 0;
	for (const arr of data) {
		ret.set(arr, offset);
		offset += arr.length;
	}
	return ret;
}
