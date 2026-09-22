import { RouteType } from "../../../route/index.js";
import {
	SFRawDataContext,
	SystemRenderDataContext,
} from "../../data-context/index.js";
import { getLayots } from "../../layout.js";
import { RenderContext } from "../../render/index.js";

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

export type RootRenderContext = RenderContext & {
	__rawSystemContext: ReturnType<typeof createRawDataContext>;
};

export async function createRenderContext(
	route: RouteType<"GET">,
	dataFn: () => any,
	leastContext?: RootRenderContext,
): Promise<RootRenderContext> {
	const rawDataContext =
		leastContext?.__rawSystemContext || createRawDataContext(route);
	let newContext: RenderContext;
	if (route.finalRoute?.context?.render) {
		const { obj, propertyKey } = route.finalRoute;
		let view = route.finalRoute.context.render;
		const layouts = route.allRoute.flatMap((r) => getLayots(r.obj));
		const [data] = await Promise.all([
			typeof (obj as any)[propertyKey] === "function"
				? dataFn()
				: (obj as any)[propertyKey],
			view.fetchResource?.(),
			...layouts.map((l) => l.fetchResource?.()),
		]);
		let render = RenderContext.create(rawDataContext.createChild(), view, data);
		newContext = layouts.reduceRight((previousValue, currentValue) => {
			return RenderContext.create(
				rawDataContext.createChild(),
				currentValue,
				undefined,
				previousValue,
			);
		}, render);
	} else {
		newContext = RenderContext.createNoop(rawDataContext.createChild());
	}
	if (leastContext) {
		leastContext.updateTree(newContext);
		rawDataContext.update(route);
	}
	return (
		leastContext ||
		Object.assign(newContext, { __rawSystemContext: rawDataContext })
	);
}
export const routeElementSelector = "sf-route";
