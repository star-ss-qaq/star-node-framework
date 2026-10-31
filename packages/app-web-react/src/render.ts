import {
	type RenderDataContext,
	WarpRenderInstance,
	type IRender,
	type RenderContext,
	type RenderInstance,
} from "@thestarweb/star-framework-app-web";
import { load, LoadableType } from "@thestarweb/star-framework-utils";
import { provideContext } from "./data-context/index.js";
import {
	FC,
	ComponentClass,
	createElement,
	useState,
	useContext,
	useMemo,
} from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, createRoot } from "react-dom/client";
import { routeContext } from "./sub-router/index.js";
import { RenderType } from "./type.js";

type Component = FC | ComponentClass;

export class ReactRender implements IRender {
	comp!: Component;
	constructor(private compLoader: LoadableType<Component>) {}
	async fetchResource() {
		this.comp = await load(this.compLoader);
	}
	// _makeContext(context: RenderDataContext, app: App) {
	// 	provideSystemContext(context, app);
	// }
	_createEl(
		context: RenderDataContext,
		prop: any,
		child: RenderContext,
		mode: RenderType,
	) {
		let _setCompProp: (newProp: any) => void;
		let _setChildContext: (newChild: RenderContext) => void;
		return {
			el: createElement(() => {
				const [childContext, setChildContext] = useState(child);
				_setChildContext = setChildContext;
				const childContextWithMode = useMemo(
					() => ({ child: childContext, mode }),
					[childContext],
				);
				return createElement(
					routeContext.Provider,
					{ value: childContextWithMode },
					provideContext(
						context,
						createElement(() => {
							const [compProp, setCompProp] = useState(prop);
							_setCompProp = setCompProp;
							return createElement(this.comp, compProp);
						}, {}),
					),
				);
			}),
			updateProp(newProp: any) {
				prop = newProp;
				_setCompProp?.(newProp);
			},
			updateChild(newChild: RenderContext) {
				_setChildContext(newChild);
			},
		};
	}
	renderToString(context: RenderDataContext, prop: any, child: RenderContext) {
		return renderToString(this._createEl(context, prop, child, "ssr").el);
	}
	_mount(
		dom: HTMLElement,
		context: RenderDataContext,
		prop: any,
		child: RenderContext,
		hydrate = false,
	) {
		const { el, updateProp, updateChild } = this._createEl(
			context,
			prop,
			child,
			hydrate ? "hydrate" : "mount",
		);
		const root = hydrate ? hydrateRoot(dom, el) : createRoot(dom);
		if (!hydrate) {
			root.render(el);
		}
		return {
			unMount: () => root.unmount(),
			updateProp,
			updateChild,
		};
	}
	mount(
		dom: HTMLElement,
		context: RenderDataContext,
		prop: any,
		child: RenderContext,
	) {
		return this._mount(dom, context, prop, child);
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
