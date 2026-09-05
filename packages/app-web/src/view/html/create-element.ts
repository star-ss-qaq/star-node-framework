import { HTMLVElement, HTMLVNode, VNodeType } from "./types.js";

export function createEelment(
	type: string,
	prop: any,
	...children: (HTMLVNode | HTMLVNode[])[]
): HTMLVElement {
	return {
		type: VNodeType.Element,
		tagName: type,
		attributes: prop,
		children: children.flat(),
	};
}
export function createDoctypeElement(): HTMLVNode {
	return {
		type: VNodeType.Outher,
		text: "<!DOCTYPE html>",
	};
}
