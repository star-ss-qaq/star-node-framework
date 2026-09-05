import { Interceptor } from "../../../interceptor/index.js";
import { ResponseWithMeta } from "../../../return-types/index.js";
import {
	createDoctypeElement,
	createEelment,
	renderVDomToString,
} from "../../html/index.js";
import { HTMLVNode } from "../../html/types.js";
import { createRenderContext, routeElementSelector } from "./common.js";

const defaultHtmlEl: HTMLVNode[] = [
	createDoctypeElement(),
	createEelment("html", {}, [
		createEelment("head", {}, [createEelment("title", {}, [])]),
		createEelment("body", {}, [
			createEelment(routeElementSelector, {}, []),
			createEelment("script", { type: "module" }, [
				"import 'sf:app-main:sf-web:browser';",
			]),
		]),
	]),
];

export const serverRender: Interceptor = async (prop, next) => {
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
		return new ResponseWithMeta(
			// `<${routeElementSelector}>${render.warpRenderToString()}</${routeElementSelector}><script type="module">import 'sf:app-main:sf-web:browser';console.log(111)</script>`,
			renderVDomToString(defaultHtmlEl, {
				customizeChildrenRender: (dom) => {
					if (dom.tagName === routeElementSelector) {
						return () => render.warpRenderToString();
					}
				},
			}),
			{
				...nextRet,
				header: { "content-type": "text/html", ...nextRet.header },
			},
		);
	}
	return nextPromise;
};
