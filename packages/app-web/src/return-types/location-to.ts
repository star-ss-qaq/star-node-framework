import { redirectStatusCode } from "../view/const.js";
import { ResponseWithMeta } from "./response-with-meta.js";

export class LocationTo extends ResponseWithMeta {
	constructor(path: string, code: (typeof redirectStatusCode)[number] = 302) {
		super(undefined, { code, header: { Location: path } });
	}
}
