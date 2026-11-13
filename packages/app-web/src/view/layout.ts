import { getMetadata, initMetadata } from "@thestarweb/star-framework-utils";
import { IRender } from "./render/render.js";
import { DataHandle, ViewInfo, ViewMeta } from "./types.js";

const mateKey = "$sf:app-web:view:layout";

export function Layout(
	render: IRender,
	meta?: ViewInfo<ViewMeta>['meta'],
	dataHandle?:DataHandle
): ClassDecorator {
	return function (target) {
		initMetadata<ViewInfo<ViewMeta>[]>(target, mateKey, undefined, []).push({
			render,
			meta,
			dataHandle,
		});
	};
}
export function getLayouts(target: any) {
	return getMetadata<ViewInfo<ViewMeta>[]>(target, mateKey, undefined, []);
}
