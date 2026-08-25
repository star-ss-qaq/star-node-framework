import { IRender } from "./render.js";

export class HTMLRender implements IRender {
	constructor(
		private readonly html:
			| string
			| (() => Promise<string | { default: string }>),
	) {}
	async renderToString() {
		if (typeof this.html === "function") {
			const res = await this.html();
			if (typeof res === "string") return res;
			return res.default;
		}
		return this.html;
	}
}
