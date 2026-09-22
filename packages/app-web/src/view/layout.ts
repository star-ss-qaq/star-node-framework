import { getMetadata, initMetadata } from "@thestarweb/star-framework-utils";
import { IRender } from "./render/render.js";
import { ViewInfo, ViewMeta } from "./types.js";

const mateKey = "$sf:app-web:view:layout";

export function Layout(
	render: IRender,
	meta?: ViewInfo<ViewMeta>["meta"],
): ClassDecorator {
	return function (target) {
		initMetadata<ViewInfo<ViewMeta>[]>(target, mateKey, undefined, []).push({
			render,
			meta,
		});
	};
}
export function getLayots(target: any) {
	return getMetadata<ViewInfo<ViewMeta>[]>(target, mateKey, undefined, []);
}
