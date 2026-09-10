import { HTMLVElement, HTMLVNode, VNodeType } from "./types.js";

export function renderVDomToString(
	vDom: HTMLVNode | HTMLVNode[],
	config?: {
		customizeRender?: (
			dom: HTMLVNode,
		) => null | undefined | ((dom: HTMLVNode) => string);
		customizeChildrenRender?: (
			dom: HTMLVElement,
		) => null | undefined | ((dom: HTMLVElement) => string);
	},
): string;
export function renderVDomToString(
	vDom: HTMLVNode | HTMLVNode[],
	config: {
		customizeRender?: (
			dom: HTMLVNode,
		) => null | undefined | ((dom: HTMLVNode) => string | Promise<string>);
		customizeChildrenRender?: (
			dom: HTMLVElement,
		) => null | undefined | ((dom: HTMLVElement) => string | Promise<string>);
	},
): string | Promise<string>;
export function renderVDomToString(
	vDom: HTMLVNode | HTMLVNode[],
	config: {
		customizeRender?: (
			dom: HTMLVNode,
		) => null | undefined | ((dom: HTMLVNode) => string | Promise<string>);
		customizeChildrenRender?: (
			dom: HTMLVElement,
		) => null | undefined | ((dom: HTMLVElement) => string | Promise<string>);
	} = {},
): string | Promise<string> {
	if (Array.isArray(vDom)) {
		const allDom = vDom.map((d) => renderVDomToString(d, config));
		const render = (res: string[]) => res.join("");
		if (allDom.some((i) => i instanceof Promise))
			return Promise.all(allDom).then(render);
		return render(allDom as string[]);
	}
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
			const render = (children: string) =>
				`<${vDom.tagName}${attt}>${children}</${vDom.tagName}>`;
			if (children instanceof Promise) {
				return children.then(render);
			}
			return render(children);
		case VNodeType.Comment:
			return `<!--${vDom.conetnt}-->`;
		case VNodeType.Text:
			return vDom.conetnt;
		case VNodeType.Outher:
			return vDom.text;
	}
}
