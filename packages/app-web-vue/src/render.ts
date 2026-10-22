import {
	type RenderDataContext,
	WarpRenderInstance,
	type IRender,
	type RenderContext,
	type RenderInstance,
} from "@thestarweb/star-framework-app-web";
import {
	App,
	Component,
	createApp,
	createSSRApp,
	defineAsyncComponent,
	h,
	onMounted,
	onUpdated,
	ref,
	shallowRef,
} from "vue";
import { renderToString } from "vue/server-renderer";
import { load, LoadableType } from "@thestarweb/star-framework-utils";
import { provideSystemContext } from "./data-context/index.js";

export class VueRender implements IRender {
	comp!: Component;
	constructor(private compLoader: LoadableType<Component>) {}
	async fetchResource() {
		this.comp = await load(this.compLoader);
	}
	_makeContext(context: RenderDataContext, app: App) {
		provideSystemContext(context, app);
	}
	async renderToString(
		context: RenderDataContext,
		prop: any,
		child: RenderContext,
	) {
		const app = createApp(this.comp, prop);
		this._makeContext(context, app);
		app.component(
			"sf-route",
			defineAsyncComponent(async () => {
				const subRender = child.render;
				if (subRender instanceof VueRender) {
					return h(subRender.comp, child.prop);
				}
				const str = await child.warpRenderToString({});
				return h("div", {
					innerHTML: str,
				});
			}),
		);
		const str = await renderToString(app);
		// console.log(str);

		return str;
	}
	_mount(
		dom: HTMLElement,
		context: RenderDataContext,
		prop: any,
		child: RenderContext,
		hydrate: boolean,
	): RenderInstance {
		const refProp = shallowRef(prop);
		const refChild = shallowRef(child);
		const app = (hydrate ? createSSRApp : createApp)({
			setup: () => {
				return () => h(this.comp, refProp.value);
			},
		});
		this._makeContext(context, app);
		app.component("sf-route", {
			setup: () => {
				const divRef = ref<HTMLDivElement>();
				let ins: WarpRenderInstance | null = null;
				const render = (hydrate: boolean = false) => {
					ins?.unMount();
					ins = null;
					if (!(refChild.value.render instanceof VueRender)) {
						ins = child[hydrate ? "hydrate" : "mount"](divRef.value!, {});
					}
				};
				onMounted(() => {
					render(hydrate && !!divRef.value?.innerHTML);
				});
				onUpdated(() => {
					render();
				});
				return () => {
					if (refChild.value.render instanceof VueRender) {
						return h(refChild.value.render.comp, refChild.value.prop);
					}
					return h("div", {
						ref: divRef,
					});
				};
			},
		});
		app.mount(dom);
		return {
			unMount: () => {
				app.unmount();
			},
			updateProp: (newProp) => (refProp.value = newProp),
			updateChild: (newChild) => (refChild.value = newChild),
		};
	}
	mount(
		dom: HTMLElement,
		context: RenderDataContext,
		prop: any,
		child: RenderContext,
	) {
		return this._mount(dom, context, prop, child, false);
	}
	hydrate(
		dom: HTMLElement,
		context: RenderDataContext,
		prop: any,
		child: RenderContext,
	) {
		return this._mount(dom, context, prop, child, true);
	}
}
