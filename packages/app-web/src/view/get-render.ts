import { Interceptor } from "../interceptor/index.js";
import { ResponseWithMeta } from "../return-types/index.js";
import { parseRoute, RouteType } from "../route/index.js";
import { CallProp } from "../runtime/type.js";
import { RenderContext } from "./render/index.js";

export function getRender(prop: CallProp, data: any) {
	if (prop.method === "get") {
		const route = prop.route as RouteType<"get">;
		if (route.finalRoute?.context?.render) {
			let render = RenderContext.create(route.finalRoute?.context.render, data);
			return render;
		}
	}
}
export const serverRender: Interceptor = async (prop, next) => {
	const ret = await next(prop);
	const render = getRender(prop, ret.data);
	if (render) {
		await render.fetchResource();
		return new ResponseWithMeta(render.warpRenderToString(), {
			header: { "content-type": "text/html", ...ret.header },
		});
	}
	return ret;
};
