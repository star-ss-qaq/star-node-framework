import { ServerRuntimeContext } from "@thestarweb/star-framework-web-runtime";
import { Interceptor } from "../../../interceptor/index.js";
import { ResponseWithMeta } from "../../../return-types/index.js";
import { parseHtmlToVDom, renderVDomToString } from "../../html/index.js";
import {
	createRootRenderContext,
	routeElementSelector,
	ssrToBrowserDataKey,
} from "./common.js";
import { RenderConfig } from "../../types.js";
import { redirectStatusCode } from "../../const.js";
import { VNodeType } from "../../html/types.js";

export const createServerRender: (
	context: ServerRuntimeContext,
) => Interceptor = (context) => {
	const htmlVDdom = parseHtmlToVDom(context.indexHtml);
	return async (prop, next) => {
		const config: RenderConfig = {
			prefix: prop.context.prefix,
		};
		const nextPromise = next(prop);
		const { accept, "sec-fetch-dest": fetchDest } = prop.header;
		let pageData: any = undefined;
		if (prop.header["x-requested-with"] === "sf-page-render") {
			const data = await nextPromise;
			return new ResponseWithMeta({
				code: data.code || 200,
				headers: data.header || {},
				data: data.data,
			});
		}
		const rootContext =
			prop.method === "GET" &&
			(prop.route.finalRoute?.context as any)?.view &&
			(accept?.includes("text/html") || ["document"].includes(fetchDest))
				? await createRootRenderContext(config, prop.route, async () => {
						const ret = await nextPromise;
						pageData = ret;
						return ret;
					})
				: undefined;
		if (rootContext) {
			const { render, meta } = rootContext;
			const nextRet = await nextPromise;
			if ((redirectStatusCode as readonly any[]).includes(nextRet.code)) {
				return nextRet;
			}
			const res = await render.warpRenderToString({});
			return new ResponseWithMeta(
				renderVDomToString(htmlVDdom, {
					customizeRender(dom) {
						if (typeof dom === "object" && dom.type === VNodeType.Element) {
							if (
								["img", "script", "video"].includes(dom.tagName) &&
								dom.attributes.src?.startsWith("/")
							) {
								return () =>
									renderVDomToString({
										...dom,
										attributes: {
											...dom.attributes,
											src:
												prop.context.prefix + dom.attributes.src.substring(1),
										},
									});
							}
							if (
								["a", "link"].includes(dom.tagName) &&
								dom.attributes.href?.startsWith("/")
							) {
								return () =>
									renderVDomToString({
										...dom,
										attributes: {
											...dom.attributes,
											src:
												prop.context.prefix + dom.attributes.href.substring(1),
										},
									});
							}
						}
					},
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
						...nextRet.header,
						"content-type": "text/html; charset=utf-8",
						vary: "accept,sec-fetch-dest",
					},
				},
			);
		}
		return nextPromise;
	};
};
