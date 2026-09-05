import { parseRoute } from "../../../route/index.js";
import { RenderContext } from "../../render/index.js";
import { findRouteDom } from "../find-route-dom.js";
import { createRenderContext } from "./common.js";

function listenerRoute(callback: () => void) {
	const rawPush = history.pushState;
	history.pushState = (data, un, url) => {
		rawPush.call(history, data, un, url);
		if (url) setTimeout(callback);
	};
	window.addEventListener("popstate", () => {
		setTimeout(callback);
	});
}

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

	let currentRenderID = 0;
	listenerRoute(async () => {
		const thisRenderId = ++currentRenderID;
		const route = routes("GET", location.pathname);
		const newcontext =
			(await createRenderContext(route, getData)) || RenderContext.createNoop();
		if (thisRenderId === currentRenderID) {
			context.updateTree(newcontext);
		}
	});
	const routesElements = findRouteDom();
	routesElements.forEach((el) => {
		context.hydrate(el as HTMLElement);
	});
};
