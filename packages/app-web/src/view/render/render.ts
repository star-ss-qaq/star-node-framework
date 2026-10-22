import {
	forkDataContextRecord,
	RenderDataContext,
	SFDataContext,
	SystemRenderDataContext,
	UserRenderDataContext,
} from "../data-context/index.js";
import { parseHtmlToVDom } from "../html/parse-html-to-v-dom.js";
import { findRouteDom } from "../utils/index.js";

export interface RenderInstance {
	unMount?(): void;
	updateProp?(newProp: any): void;
	updateChild?(newContext: RenderContext): void;
}
export class WarpRenderInstance {
	constructor(
		public readonly context: RenderContext,
		public readonly dom: HTMLElement,
		public readonly rawInstance: RenderInstance,
		public readonly dataContext: RenderDataContext,
	) {
		this.context._instances.push(this);
	}
	unMount() {
		if (this.rawInstance.unMount) {
			this.rawInstance.unMount();
		} else {
			this.dom.innerHTML = "";
		}
		Object.values(this.dataContext).forEach((o) => {
			Object.values<any>(o).forEach(
				(c) => c instanceof SFDataContext && c.destroy(),
			);
		});
		this.context._instances = this.context._instances.filter((i) => i !== this);
	}
}

export interface IRender {
	fetchResource?(): Promise<void> | void;
	renderToString?(
		dataContext: RenderDataContext,
		prop: any,
		chrild: RenderContext,
	): string | Promise<string>;
	mount?(
		dom: HTMLElement,
		dataContext: RenderDataContext,
		prop: any,
		chrild: RenderContext,
	): RenderInstance;
	hydrate?(
		dom: HTMLElement,
		dataContext: RenderDataContext,
		prop: any,
		chrild: RenderContext,
	): RenderInstance;
}
export class RenderContext {
	private constructor(
		private _systemDataContext: SystemRenderDataContext,
		private _render: IRender,
		private _prop: any,
		// 结尾始终要跟一个空的RenderContext
		// 原因：比如一个layout命中了 但是下面的页面没有命中，但是layout切换页面时，layout本身不应该重新渲染，所以需要一开始给它一个占位的空姐点，然后更新这个空节点
		private _child?: RenderContext,
	) {}
	public static createNoop(systemDataContext: SystemRenderDataContext) {
		return new RenderContext(systemDataContext, {}, {});
	}
	public static create(
		systemDataContext: SystemRenderDataContext,
		render: IRender,
		prop: any,
		child: RenderContext = this.createNoop(systemDataContext),
	) {
		return new RenderContext(systemDataContext, render, prop, child);
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
	async warpRenderToString(dataContext: UserRenderDataContext) {
		if (this._child) {
			return (
				(await this.render.renderToString?.(
					{
						system: forkDataContextRecord(this._systemDataContext),
						user: forkDataContextRecord(dataContext),
					},
					this.prop,
					this._child,
				)) || ""
			);
		}
		return "";
	}
	/**
	 * @internal
	 */
	_instances: WarpRenderInstance[] = [];
	mount(dom: HTMLElement, dataContext: UserRenderDataContext) {
		let instance: RenderInstance = {};
		const fullDataContext = {
			system: forkDataContextRecord(this._systemDataContext),
			user: forkDataContextRecord(dataContext),
		};
		if (this._child) {
			if (this.render.mount) {
				instance = this.render.mount(
					dom,
					fullDataContext,
					this.prop,
					this._child,
				);
			} else if (this.render.renderToString) {
				Promise.resolve(
					this.render.renderToString(fullDataContext, this.prop, this._child),
				).then((html) => (dom.innerHTML = html));
			}
		}
		return new WarpRenderInstance(this, dom, instance, fullDataContext);
	}
	hydrate(dom: HTMLElement, dataContext: UserRenderDataContext) {
		let instance: RenderInstance = {};
		const fullDataContext = {
			system: forkDataContextRecord(this._systemDataContext),
			user: forkDataContextRecord(dataContext),
		};
		if (this._child) {
			if (this.render.hydrate) {
				instance = this.render.hydrate(
					dom,
					fullDataContext,
					this.prop,
					this._child,
				);
			} else if (this.render.renderToString) {
				// const vDom = parseHtmlToVDom(
				// 	this.render.renderToString(this.prop, this._child),
				// );
				const routeDoms = findRouteDom(dom);
				routeDoms.forEach((r) => this.child!.hydrate(r, dataContext));
			} else if (this.render.mount) {
				instance = this.render.mount(
					dom,
					fullDataContext,
					this.prop,
					this._child,
				);
			}
		}
		return new WarpRenderInstance(this, dom, instance, fullDataContext);
	}
	unmountAll() {
		this._instances.forEach((i) => i.unMount());
	}
	async updateTree(node: RenderContext, allowRender = true) {
		let shoudldRerender = false;
		const unRerenderTask: (() => any)[] = [];
		if (this._render !== node._render) {
			this._render = node._render;
			if (allowRender) {
				shoudldRerender = true;
			}
		}
		if (this._prop !== node._prop) {
			this._prop = node._prop;
			if (allowRender) {
				if (this._instances.every((i) => i.rawInstance.updateProp)) {
					unRerenderTask.push(() => {
						this._instances.forEach((i) => {
							i.rawInstance.updateProp!(node._prop);
						});
					});
				} else {
					shoudldRerender = true;
				}
			}
		}
		let childUpdated = false;
		let shoudUpdateSubtree = false;
		if (this._child !== node._child) {
			if (!this._child || !node._child) {
				this._child = node._child;
			} else {
				shoudUpdateSubtree = true;
			}
			if (this._instances.every((i) => i.rawInstance.updateChild)) {
				childUpdated = true;
				unRerenderTask.push(() => {
					this._instances.forEach((i) => {
						if (i.rawInstance.updateChild) {
							i.rawInstance.updateChild(node._child!);
						}
					});
				});
			}
		}
		let isRerender = allowRender && shoudldRerender;

		if (shoudUpdateSubtree) {
			await this._child?.updateTree(
				node._child!,
				allowRender && !childUpdated && !isRerender,
			);
		}
		if (isRerender) {
			await Promise.all(
				this._instances.map(async (i) => {
					i.unMount();
					await this.mount(i.dom, i.dataContext.user);
				}),
			);
		} else {
			await Promise.all(unRerenderTask.map((i) => i()));
		}
	}
}
