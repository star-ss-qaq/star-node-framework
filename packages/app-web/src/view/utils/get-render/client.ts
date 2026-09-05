import { parseRoute } from "../../../route/index.js";
import { RenderContext } from "../../render/index.js";
import { findRouteDom } from "../find-route-dom.js";
import { createRenderContext } from "./common.js";

export const clientRender = async (routes: ReturnType<typeof parseRoute>) => {
	const route = routes("GET", location.pathname);
	const getData = async () => {
		const res = await fetch(location.href);
		if (res.headers.get("content-type")?.includes("json")) {
			return await res.json();
		}
		return undefined;
	};
	const context =
		(await createRenderContext(route, getData)) || RenderContext.createNoop();

	const routesElements = findRouteDom();
	routesElements.forEach((el) => {
		context.hydrate(el as HTMLElement);
	});
};
