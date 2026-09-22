import { ServerRuntimeContext } from "@thestarweb/star-framework-web-runtime-node";
import { Interceptor } from "../../../interceptor/index.js";
import { ResponseWithMeta } from "../../../return-types/index.js";
import {
	createDoctypeElement,
	createElement,
	parseHtmlToVDom,
	renderVDomToString,
} from "../../html/index.js";
import { HTMLVNode } from "../../html/types.js";
import { createRenderContext, routeElementSelector } from "./common.js";

const defaultHtmlEl: HTMLVNode[] = [
	createDoctypeElement(),
	createElement("html", {}, [
		createElement("head", {}, [createElement("title", {}, [])]),
		createElement("body", {}, [
			createElement(routeElementSelector, {}, []),
			createElement("sf-main", {}),
		]),
	]),
];

export const createServerRender: (
	context: ServerRuntimeContext,
) => Interceptor = (context) => {
	const htmlVDdom = parseHtmlToVDom(context.indexHtml);
	return async (prop, next) => {
		const nextPromise = next(prop);
		const { accept, "sec-fetch-dest": fetchDest } = prop.header;
		const rootContext =
			prop.method === "GET" &&
			(prop.route.finalRoute?.context as any)?.view &&
			(accept?.includes("text/html") || ["document"].includes(fetchDest))
				? await createRenderContext(prop.route, async () => {
						const ret = await nextPromise;
						return ret.data;
					})
				: undefined;
		console.log(rootContext);
		if (rootContext) {
			const { render, meta } = rootContext;
			const nextRet = await nextPromise;
			const res = await render.warpRenderToString({});
			return new ResponseWithMeta(
				renderVDomToString(htmlVDdom, {
					customizeChildrenRender: (dom) => {
						if (dom.tagName === routeElementSelector) {
							return () => res;
						}
						if (dom.tagName === "head") {
							return (dom, raw) => {
								let res = [raw()];
								res.push(`<title>${meta.title}</title>`);
								if (meta.htmlMeta) {
									Object.entries(meta.htmlMeta).forEach(([k, v]) =>
										res.push(`<meta name="${k}" content="${v}">`),
									);
								}
								return res.join("");
							};
						}
					},
				}),
				{
					...nextRet,
					header: {
						"content-type": "text/html; charset=utf-8",
						...nextRet.header,
					},
				},
			);
		}
		return nextPromise;
	};
};
