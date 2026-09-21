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
	const addedEl = new WeakSet<HTMLAnchorElement>();
	function handleAClick(ev: MouseEvent) {
		const target = ev.target as HTMLAnchorElement;
		if (target.download || target.target || ev.defaultPrevented) return;
		const rawHref = target.getAttribute("href");
		if (!rawHref || rawHref.startsWith("#")) return;
		const route = routes("GET", target.pathname);
		if (route.finalRoute) {
			history.pushState(null, "", target.href.substring(target.origin.length));
			ev.preventDefault();
		}
	}
	window.addEventListener(
		"click",
		(ev) => {
			if (ev.target instanceof HTMLElement) {
				let el: HTMLElement | null = ev.target as HTMLElement;
				while (el && el !== document.body) {
					if (el instanceof HTMLAnchorElement && !addedEl.has(el)) {
						addedEl.add(el);
						el.addEventListener("click", handleAClick, true);
					}
					el = el.parentElement;
				}
			}
		},
		true,
	);
	const routesElements = findRouteDom();
	routesElements.forEach((el) => {
		context.hydrate(el as HTMLElement);
	});
};
