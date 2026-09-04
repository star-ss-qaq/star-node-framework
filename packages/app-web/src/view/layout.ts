import { getMetadata, initMetadata } from "@thestarweb/star-framework-utils";
import { IRender } from "./render/render.js";

const mateKey = "$sf:app-web:view:layout";

export function Layout(render: IRender): ClassDecorator {
	return function (target) {
		initMetadata<IRender[]>(target, mateKey, undefined, []).push(render);
	};
}
export function getLayots(target: any) {
	return getMetadata<IRender[]>(target, mateKey, undefined, []);
}
