import { parseHtmlToVDom } from "../html/parse-html-to-v-dom.js";
import { findRouteDom } from "../utils/index.js";

export interface RenderInstance {
	unMount?(): void;
	updateProp?(newProp: any): void;
	updateChild?(newContext: RenderContext): void;
}
export class WarpRenderInstance {
	constructor(
		public readonly conetxt: RenderContext,
		public readonly dom: HTMLElement,
		public readonly rawInstance: RenderInstance,
	) {
		this.conetxt._instances.push(this);
	}
	unMount() {
		this.rawInstance.unMount?.();
		this.conetxt._instances.filter((i) => i !== this);
	}
}

export interface IRender {
	fetchResource?(): Promise<void> | void;
	renderToString?(prop: any, chrild: RenderContext): string;
	mount?(dom: HTMLElement, prop: any, chrild: RenderContext): RenderInstance;
	hydrate?(dom: HTMLElement, prop: any, chrild: RenderContext): RenderInstance;
}
export class RenderContext {
	private constructor(
		public _render: IRender,
		public _prop: any,
		// 结尾始终要跟一个空的RenderContext
		// 原因：比如一个layout命中了 但是下面的页面没有命中，但是layout切换页面时，layout本身不应该重新渲染，所以需要一开始给它一个占位的空姐点，然后更新这个空节点
		private _child?: RenderContext,
	) {}
	public static createNoop() {
		return new RenderContext({}, {});
	}
	public static create(
		render: IRender,
		prop: any,
		child: RenderContext = this.createNoop(),
	) {
		return new RenderContext(render, prop, child);
	}
	get render() {
		return this._render;
	}
	get prop() {
		return this._prop;
	}
	get child() {
		return this._child;
	}
	warpRenderToString() {
		if (this._child) {
			return this.render.renderToString?.(this.prop, this._child) || "";
		}
		return "";
	}
	private _instances: WarpRenderInstance[] = [];
	mount(dom: HTMLElement) {
		let instance: RenderInstance = {};
		if (this._child) {
			if (this.render.mount) {
				instance = this.render.mount(dom, this.prop, this._child);
			} else if (this.render.renderToString) {
				dom.innerHTML = this.render.renderToString(this.prop, this._child);
			}
		}
		return new WarpRenderInstance(this, dom, instance);
	}
	hydrate(dom: HTMLElement) {
		let instance: RenderInstance = {};
		if (this._child) {
			if (this.render.hydrate) {
				instance = this.render.hydrate(dom, this.prop, this._child);
			} else if (this.render.renderToString) {
				// const vDom = parseHtmlToVDom(
				// 	this.render.renderToString(this.prop, this._child),
				// );
				const routeDoms = findRouteDom(dom);
				routeDoms.forEach((r) => this.child!.hydrate(r));
			} else if (this.render.mount) {
				instance = this.render.mount(dom, this.prop, this._child);
			}
		}
		return new WarpRenderInstance(this, dom, instance);
	}
	unmountAll() {
		this._instances.forEach((i) => i.unMount());
	}
	updateTree(node: RenderContext) {
		const reRendeRange = new Set<WarpRenderInstance>();
		if (this._render !== node._render) {
			this._render = node._render;
			this._instances.forEach((i) => reRendeRange.add(i));
		}
		if (this._child !== node._child) {
			if (!this._child || !node._child) {
				this._child = node._child;
			} else {
				this._child?.updateTree(node._child);
			}
			if (node._child) {
				this._instances.forEach((i) => {
					if (i.rawInstance.updateChild) {
						i.rawInstance.updateChild(node._child!);
					}
				});
			}
		}
		if (this._prop !== node._prop) {
			this._prop = node._prop;
			this._instances.forEach((i) => {
				if (i.rawInstance.updateProp) {
					i.rawInstance.updateProp(node._prop);
				} else {
					reRendeRange.add(i);
				}
			});
		}
		reRendeRange.forEach((i) => {
			i.unMount();
			this.mount(i.dom);
		});
	}
}
