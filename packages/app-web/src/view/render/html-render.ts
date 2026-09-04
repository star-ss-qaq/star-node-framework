import { parseHtmlToVDom } from "../html/index.js";
import { IRender } from "./render.js";
import { SFVDomRender } from "./sf-v-dom-render.js";

export class HTMLRender extends SFVDomRender {
	constructor(
		private readonly htmlFn:
			| string
			| (() => Promise<string | { default: string }>),
	) {
		super(async () => {
			if (typeof this.htmlFn === "function") {
				const res = await this.htmlFn();
				this.html = typeof res === "string" ? res : res.default;
			} else {
				this.html = this.htmlFn;
			}
			return parseHtmlToVDom(this.html);
		});
	}
	private html = "";
}
