import { IRender } from "./render.js";

export class HTMLRender implements IRender {
	constructor(
		private readonly htmlFn:
			| string
			| (() => Promise<string | { default: string }>),
	) {}
	private html = "";
	async fetchResource() {
		if (typeof this.htmlFn === "function") {
			const res = await this.htmlFn();
			this.html = typeof res === "string" ? res : res.default;
		} else {
			this.html = this.htmlFn;
		}
	}
	renderToString() {
		return this.html;
	}
}
