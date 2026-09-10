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
		const render =
			prop.method === "GET" &&
			(accept?.includes("text/html") || ["document"].includes(fetchDest))
				? await createRenderContext(prop.route, async () => {
						const ret = await nextPromise;
						return ret.data;
					})
				: undefined;
		if (render) {
			const nextRet = await nextPromise;
			const res = await render.warpRenderToString();
			return new ResponseWithMeta(
				renderVDomToString(htmlVDdom, {
					customizeChildrenRender: (dom) => {
						if (dom.tagName === routeElementSelector) {
							return () => res;
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
