import { Layout, View } from "@thestarweb/star-framework-app-web";
import { ReactRender } from "@thestarweb/star-framework-app-web-react";

@Layout(new ReactRender(()=>import('@/react-view/layout.js')))
export class ReactRoute {
	@View("", new ReactRender(() => import("@/react-view/index.js")))
	index: undefined;
}
