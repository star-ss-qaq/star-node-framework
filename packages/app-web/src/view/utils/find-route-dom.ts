import { routeTagName } from "../const.js";

export function findRouteDom(root: HTMLElement = document.body) {
	const result: HTMLElement[] = [];
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
		acceptNode(node) {
			if (
				node instanceof HTMLElement &&
				node.tagName.toLocaleLowerCase() === routeTagName.toLocaleLowerCase()
			) {
				result.push(node);
				return NodeFilter.FILTER_REJECT; // 跳过子节点，因为它们是嵌套的
			}
			return NodeFilter.FILTER_ACCEPT;
		},
	});
	while (walker.nextNode()) {}
	return result;
}
