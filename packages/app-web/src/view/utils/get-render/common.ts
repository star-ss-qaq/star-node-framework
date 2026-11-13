import { title } from "node:process";
import { RouteType } from "../../../route/index.js";
import {
	SFRawDataContext,
	SystemRenderDataContext,
} from "../../data-context/index.js";
import { getLayouts } from "../../layout.js";
import { RenderContext } from "../../render/index.js";
import { RenderConfig, ViewMeta } from "../../types.js";
import { SFWebRequest } from "../../../request/index.js";
import { ResponseWithMeta } from "../../../return-types/response-with-meta.js";

function createRawDataContext(config: RenderConfig, route: RouteType<"GET">) {
	const routeRawContext = new SFRawDataContext(route);
	const { baseUrl } = config;
	return {
		update(route: RouteType<"GET">) {
			routeRawContext.update(route);
		},
		createChild(): SystemRenderDataContext {
			return {
				route: routeRawContext.createChild(),
				request: new SFWebRequest(baseUrl),
				baseUrl,
			};
		},
	};
}

export interface RootRenderContext {
	render: RenderContext;
	data: any;
	rawSystemDataContext: ReturnType<typeof createRawDataContext>;
	meta: ViewMeta;
}

async function createRenderContext(
	route: RouteType<"GET">,
	dataFn: () => any,
	dataContext: ReturnType<typeof createRawDataContext>,
): Promise<Pick<RootRenderContext, "render" | "meta" | "data">> {
	if (route.finalRoute?.context?.view) {
		const { obj, propertyKey } = route.finalRoute;
		let view = route.finalRoute.context.view;
		const layouts = route.allRoute.flatMap((r) => getLayouts(r.obj));
		const [data] = await Promise.all([
			typeof (obj as any)[propertyKey] === "function"
				? dataFn()
				: new ResponseWithMeta((obj as any)[propertyKey]),
			view.render.fetchResource?.(),
			...layouts.map((l) => l.render.fetchResource?.()),
		]);
		const {
			handleSelfData = (data: any) => data.data,
			handleParentData = (data: any) =>
				data.code && (data.code < 200 || data.code >= 300) ? data : undefined,
		} = view.dataHandle || {};
		const selfData = handleSelfData(data);
		let render = RenderContext.create(
			dataContext.createChild(),
			view.render,
			selfData,
		);
		let meta =
			typeof view.meta === "function"
				? view.meta(selfData, selfData)
				: view.meta || { title: "" };
		return layouts.reduceRight(
			({ render, meta, data }, currentValue) => {
				const {
					handleSelfData = () => undefined,
					handleParentData = (data: any) => data,
				} = currentValue.dataHandle || {};
				const selfData = handleSelfData(data);
				return {
					render: RenderContext.create(
						dataContext.createChild(),
						currentValue.render,
						selfData,
						render,
					),
					meta:
						typeof currentValue.meta === "function"
							? currentValue.meta(meta, selfData)
							: currentValue.meta || meta,
					data: handleParentData(data),
				};
			},
			{ render, meta, data: handleParentData(data) },
		);
	} else {
		return {
			render: RenderContext.createNoop(dataContext.createChild()),
			meta: { title: "" },
			data: null,
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
