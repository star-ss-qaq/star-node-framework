import { RouteType } from "../../../route/index.js";
import { getLayots } from "../../layout.js";
import { RenderContext } from "../../render/index.js";

export async function createRenderContext(
	route: RouteType<"GET">,
	dataFn: () => any,
) {
	if (route.finalRoute?.context?.render) {
		let view = route.finalRoute.context.render;
		const layouts = route.allRoute.flatMap((r) => getLayots(r.obj));
		const [data] = await Promise.all([
			dataFn(),
			view.fetchResource?.(),
			...layouts.map((l) => l.fetchResource?.()),
		]);
		let render = RenderContext.create(view, data);
		return layouts.reduceRight((previousValue, currentValue) => {
			return RenderContext.create(currentValue, undefined, previousValue);
		}, render);
	}
}
export const routeElementSelector = "sf-route";
