import { title } from "node:process";
import { RouteType } from "../../../route/index.js";
import {
	SFRawDataContext,
	SystemRenderDataContext,
} from "../../data-context/index.js";
import { getLayots } from "../../layout.js";
import { RenderContext } from "../../render/index.js";
import { ViewMeta } from "../../types.js";

function createRawDataContext(route: RouteType<"GET">) {
	const routeRawcontext = new SFRawDataContext(route);
	const requestRawcontext = new SFRawDataContext(null);
	return {
		update(route: RouteType<"GET">) {
			routeRawcontext.update(route);
		},
		createChild(): SystemRenderDataContext {
			return {
				route: routeRawcontext.createChild(),
				request: requestRawcontext.createChild(),
			};
		},
	};
}

export type RootRenderContext = {
	render: RenderContext;
	rawSystemDataContext: ReturnType<typeof createRawDataContext>;
	meta: ViewMeta;
};

export async function createRenderContext(
	route: RouteType<"GET">,
	dataFn: () => any,
	leastContext?: RootRenderContext,
): Promise<RootRenderContext> {
	const rawDataContext =
		leastContext?.rawSystemDataContext || createRawDataContext(route);
	let newContext: RenderContext;
	let meta: ViewMeta;
	if (route.finalRoute?.context?.view) {
		const { obj, propertyKey } = route.finalRoute;
		let view = route.finalRoute.context.view;
		const layouts = route.allRoute.flatMap((r) => getLayots(r.obj));
		const [data] = await Promise.all([
			typeof (obj as any)[propertyKey] === "function"
				? dataFn()
				: (obj as any)[propertyKey],
			view.render.fetchResource?.(),
			...layouts.map((l) => l.render.fetchResource?.()),
		]);
		let render = RenderContext.create(
			rawDataContext.createChild(),
			view.render,
			data,
		);
		let baseData =
			typeof view.meta === "function"
				? view.meta(data)
				: view.meta || { title: "" };
		({ newContext, meta } = layouts.reduceRight(
			({ newContext, meta }, currentValue) => {
				return {
					newContext: RenderContext.create(
						rawDataContext.createChild(),
						currentValue.render,
						undefined,
						newContext,
					),
					meta:
						typeof currentValue.meta === "function"
							? currentValue.meta(meta)
							: currentValue.meta || meta,
				};
			},
			{ newContext: render, meta: baseData },
		));
	} else {
		newContext = RenderContext.createNoop(rawDataContext.createChild());
		meta = { title: "" };
	}
	if (leastContext) {
		leastContext.render.updateTree(newContext);
		rawDataContext.update(route);
		newContext = leastContext.render;
	}
	return {
		render: newContext,
		rawSystemDataContext: rawDataContext,
		meta,
	};
}
export const routeElementSelector = "sf-route";
