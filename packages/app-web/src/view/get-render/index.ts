import { Interceptor } from "../../interceptor/index.js";
import { ResponseWithMeta } from "../../return-types/index.js";
import { parseRoute, RouteType } from "../../route/index.js";
import { getLayots } from "../layout.js";
import { RenderContext } from "../render/index.js";

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
			return RenderContext.create(currentValue, {}, previousValue);
		}, render);
	}
}
const routeElementSelector = "sf-route";
export const serverRender: Interceptor = async (prop, next) => {
	const nextPromise = next(prop);
	const render =
		prop.method === "GET"
			? await createRenderContext(prop.route, async () => {
					const ret = await nextPromise;
					return ret.data;
				})
			: undefined;
	if (render) {
		const nextRet = await nextPromise;
		return new ResponseWithMeta(
			`<${routeElementSelector}>${render.warpRenderToString()}</${routeElementSelector}><script type="module">import 'sf:app-main:sf-web:browser'</script>`,
			{
				...nextRet,
				header: { "content-type": "text/html", ...nextRet.header },
			},
		);
	}
	return nextPromise;
};
export const clientRender = async (routes: ReturnType<typeof parseRoute>) => {
	const route = routes("GET", location.pathname);
	const getData = async () => {
		const res = await fetch(location.href);
		return await res.json();
	};
	const context = await createRenderContext(route, getData);
	const [routeEl] = document.getElementsByTagName(routeElementSelector);
	if (!routeEl) return;
	context?.mount(routeEl as HTMLElement);
};
