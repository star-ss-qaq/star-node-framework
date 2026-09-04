import { renderVDomToString } from "../html/render-v-dom-to-string.js";
import { HTMLVNode } from "../html/types.js";
import { IRender, RenderContext } from "./render.js";

export class SFVDomRender implements IRender {
	constructor(
		private readonly domFn:
			| HTMLVNode
			| HTMLVNode[]
			| (() => Promise<
					HTMLVNode | HTMLVNode[] | { default: HTMLVNode | HTMLVNode[] }
			  >),
	) {}
	private dom: HTMLVNode | HTMLVNode[] = [];
	async fetchResource() {
		if (typeof this.domFn === "function") {
			const res = await this.domFn();
			this.dom =
				typeof res === "object" && "default" in res ? res.default : res;
		} else {
			this.dom = this.domFn;
		}
	}
	renderToString(prop: any, chrild: RenderContext) {
		return renderVDomToString(this.dom, {
			customizeChildrenRender: (el) => {
				if (el.tagName === "sf-route") {
					return () => chrild.warpRenderToString();
				}
			},
		});
	}
}
