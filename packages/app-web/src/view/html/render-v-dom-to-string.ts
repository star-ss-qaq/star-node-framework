import { HTMLVElement, HTMLVNode, VNodeType } from "./types.js";

export function renderVDomToString(
	vDom: HTMLVNode | HTMLVNode[],
	config: {
		customizeRender?: (
			dom: HTMLVNode,
		) => null | undefined | ((dom: HTMLVNode) => string);
		customizeChildrenRender?: (
			dom: HTMLVElement,
		) => null | undefined | ((dom: HTMLVElement) => string);
	} = {},
): string {
	if (Array.isArray(vDom))
		return vDom.map((d) => renderVDomToString(d, config)).join("");
	const customizeRender = config.customizeRender?.(vDom);
	if (customizeRender) return customizeRender(vDom);
	if (typeof vDom === "string") return vDom;
	switch (vDom.type) {
		case VNodeType.Element:
			const attt = Object.entries(vDom.attributes)
				.map(([k, v]) => ` ${k}=${JSON.stringify(v)}`)
				.join("");
			const customizeChildrenRender = config.customizeChildrenRender?.(vDom);
			const children = customizeChildrenRender
				? customizeChildrenRender(vDom)
				: renderVDomToString(vDom.children, config);
			return `<${vDom.tagName}${attt}>${children}</${vDom.tagName}>`;
		case VNodeType.Comment:
			return `<!--${vDom.conetnt}-->`;
		case VNodeType.Text:
			return vDom.conetnt;
		case VNodeType.Outher:
			return vDom.text;
	}
}
