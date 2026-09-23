import { ServerRuntimeContext } from "@thestarweb/star-framework-web-runtime-node";
import { Interceptor } from "../../../interceptor/index.js";
import { ResponseWithMeta } from "../../../return-types/index.js";
import { parseHtmlToVDom, renderVDomToString } from "../../html/index.js";
import {
	createRootRenderContext,
	routeElementSelector,
	ssrToBrowserDataKey,
} from "./common.js";
import { RenderConfig } from "../../types.js";

export const createServerRender: (
	context: ServerRuntimeContext,
) => Interceptor = (context) => {
	const htmlVDdom = parseHtmlToVDom(context.indexHtml);
	return async (prop, next) => {
		const config: RenderConfig = {
			baseUrl: "/",
		};
		const nextPromise = next(prop);
		const { accept, "sec-fetch-dest": fetchDest } = prop.header;
		let pageData: any = undefined;
		const rootContext =
			prop.method === "GET" &&
			(prop.route.finalRoute?.context as any)?.view &&
			(accept?.includes("text/html") || ["document"].includes(fetchDest))
				? await createRootRenderContext(config, prop.route, async () => {
						const ret = await nextPromise;
						pageData = ret.data;
						return ret.data;
					})
				: undefined;
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
								let res = [
									`<script>window.${ssrToBrowserDataKey}=${JSON.stringify({ config, pageData })}</script>`,
									raw(),
								];
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
