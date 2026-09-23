import { title } from "node:process";
import { RouteType } from "../../../route/index.js";
import {
	SFRawDataContext,
	SystemRenderDataContext,
} from "../../data-context/index.js";
import { getLayots } from "../../layout.js";
import { RenderContext } from "../../render/index.js";
import { RenderConfig, ViewMeta } from "../../types.js";
import { SFWebRequest } from "../../../request/index.js";

function createRawDataContext(config: RenderConfig, route: RouteType<"GET">) {
	const routeRawcontext = new SFRawDataContext(route);
	const { baseUrl } = config;
	return {
		update(route: RouteType<"GET">) {
			routeRawcontext.update(route);
		},
		createChild(): SystemRenderDataContext {
			return {
				route: routeRawcontext.createChild(),
				request: new SFWebRequest(baseUrl),
				baseUrl,
			};
		},
	};
}

export interface RootRenderContext {
	render: RenderContext;
	rawSystemDataContext: ReturnType<typeof createRawDataContext>;
	meta: ViewMeta;
}

async function createRenderContext(
	route: RouteType<"GET">,
	dataFn: () => any,
	dataContext: ReturnType<typeof createRawDataContext>,
): Promise<Pick<RootRenderContext, "render" | "meta">> {
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
			dataContext.createChild(),
			view.render,
			data,
		);
		let meta =
			typeof view.meta === "function"
				? view.meta(data)
				: view.meta || { title: "" };
		return layouts.reduceRight(
			({ render, meta }, currentValue) => {
				return {
					render: RenderContext.create(
						dataContext.createChild(),
						currentValue.render,
						undefined,
						render,
					),
					meta:
						typeof currentValue.meta === "function"
							? currentValue.meta(meta)
							: currentValue.meta || meta,
				};
			},
			{ render, meta },
		);
	} else {
		return {
			render: RenderContext.createNoop(dataContext.createChild()),
			meta: { title: "" },
		};
	}
}

export async function createRootRenderContext(
	config: RenderConfig,
	route: RouteType<"GET">,
	dataFn: () => any,
): Promise<RootRenderContext> {
	const rawSystemDataContext = createRawDataContext(config, route);
	return {
		...(await createRenderContext(route, dataFn, rawSystemDataContext)),
		rawSystemDataContext,
	};
}
export async function updateRootRenderContext(
	rootContext: RootRenderContext,
	route: RouteType<"GET">,
	dataFn: () => any,
) {
	const newRenderContext = await createRenderContext(
		route,
		dataFn,
		rootContext.rawSystemDataContext,
	);
	rootContext.meta = newRenderContext.meta;
	rootContext.render.updateTree(newRenderContext.render);
	rootContext.rawSystemDataContext.update(route);
	return rootContext;
}

export const routeElementSelector = "sf-route";
export const ssrToBrowserDataKey = "__SFWebAppInitData";
