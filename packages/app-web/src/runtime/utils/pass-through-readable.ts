import { PassThrough, Readable } from "stream";

export class PassThroughReadable extends Readable {
	constructor(private readonly p: PassThrough) {
		super();
	}
	_read(size: number): void {
		return this.p.read(size);
	}
}
