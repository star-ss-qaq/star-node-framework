import {
	WarpRenderInstance,
	type IRender,
	type RenderContext,
	type RenderInstance,
} from "@thestarweb/star-framework-app-web";
import {
	Component,
	createApp,
	createSSRApp,
	defineAsyncComponent,
	h,
	onMounted,
	onUpdated,
	ref,
	shallowRef,
	watch,
} from "vue";
import { renderToString } from "vue/server-renderer";
import { load, LoadableType } from "@thestarweb/star-framework-utils";
import { LazyHydrationWrapper } from "vue3-lazy-hydration";

export class VueRender implements IRender {
	comp!: Component;
	constructor(private compLoader: LoadableType<Component>) {}
	async fetchResource() {
		this.comp = await load(this.compLoader);
	}
	async renderToString(prop: any, child: RenderContext) {
		const app = createApp(this.comp, prop);
		app.component(
			"sf-route",
			defineAsyncComponent(async () => {
				const subRender = child.render;
				if (subRender instanceof VueRender) {
					return h(subRender.comp, prop);
				}
				const str = await child.warpRenderToString();
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
		prop: any,
		chrild: RenderContext,
		hydrate: boolean,
	): RenderInstance {
		const refProp = shallowRef(prop);
		const refChild = shallowRef(chrild);
		const app = (hydrate ? createSSRApp : createApp)(() =>
			h(this.comp, refProp.value),
		);
		app.component("sf-route", {
			setup: () => {
				const divRef = ref<HTMLDivElement>();
				let ins: WarpRenderInstance | null = null;
				const render = (hydrate: boolean = false) => {
					ins?.unMount();
					ins = null;
					if (!(refChild.value.render instanceof VueRender)) {
						ins = chrild[hydrate ? "hydrate" : "mount"](divRef.value!);
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
						return h(refChild.value.render.comp);
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
	mount(dom: HTMLElement, prop: any, chrild: RenderContext) {
		return this._mount(dom, prop, chrild, false);
	}
	hydrate(dom: HTMLElement, prop: any, chrild: RenderContext) {
		return this._mount(dom, prop, chrild, true);
	}
}
