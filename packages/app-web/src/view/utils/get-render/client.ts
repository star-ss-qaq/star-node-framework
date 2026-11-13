import { ResponseWithMeta } from "../../../return-types/response-with-meta.js";
import { parseRoute } from "../../../route/index.js";
import { redirectStatusCode } from "../../const.js";
import { RenderContext } from "../../render/index.js";
import { RenderConfig, ViewMeta } from "../../types.js";
import { findRouteDom } from "../find-route-dom.js";
import { LoadingProgress } from "../loading-progress.js";
import {
	createRootRenderContext,
	ssrToBrowserDataKey,
	updateRootRenderContext,
} from "./common.js";

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

function handleMeta(meta: ViewMeta) {
	document.title = meta.title;
}

export const clientRender = async (routes: ReturnType<typeof parseRoute>) => {
	const { config, pageData } = (window as any)[ssrToBrowserDataKey];
	delete (window as any)[ssrToBrowserDataKey];
	const route = routes("GET", location.pathname);
	const getData = async () => {
		const res = await fetch(location.href, {
			redirect: "manual",
			headers: { "x-requested-with": "sf-page-render" },
		});
		if (res.type === "opaqueredirect") {
			console.log(
				"this page is redirect, however, we can not get the redirect url, so we can only reload the page for redirect from server",
			);
			setTimeout(() => {
				location.reload();
			}, 3000);
			return new Promise(() => {});
		}
		if (res.headers.get("content-type")?.includes("json")) {
			const data = await res.json();
			return new ResponseWithMeta(data.data, data);
		}
		return undefined;
	};
	const context = await createRootRenderContext(
		config,
		route,
		() => new ResponseWithMeta(pageData.data, pageData),
	);
	handleMeta(context.meta);
	listenerRoute(async () => {
		const route = routes("GET", location.pathname);
		LoadingProgress.instance.start();
		const c = await updateRootRenderContext(context, route, getData);
		handleMeta(c.meta);
		LoadingProgress.instance.end();
	});
	const addedEl = new WeakSet<HTMLAnchorElement>();
	function handleAClick(this: HTMLAnchorElement, ev: MouseEvent) {
		const target = this;
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
		context.render.hydrate(el as HTMLElement, {});
	});
};
