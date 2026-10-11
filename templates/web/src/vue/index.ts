import { HTMLRender, Layout, View } from "@thestarweb/star-framework-app-web";
import { VueRender } from "@thestarweb/star-framework-app-web-vue";
import { Param } from "@thestarweb/star-framework-app-web/src/params/index.js";

@Layout(new VueRender(() => import("./layout.vue")), (meta) => ({
	...meta,
	title: `${meta.title} - vue`,
}))
export class VueRoute {
	@View("", new VueRender(() => import("./Home.vue")), { title: "home" })
	index: undefined;
	@View("about", new VueRender(() => import("./About.vue")), { title: "about" })
	about: undefined;
	@View("html1", new HTMLRender("这是一段HTML(1)"), { title: "html1" })
	html1: undefined;
	@View("html2", new HTMLRender("这是一段HTML(2)"), { title: "html2" })
	html2: undefined;
	@View("param/:id", new VueRender(() => import("./Param.vue")), ({ id }) => ({
		title: `param - ${id}`,
	}))
	withParam(@Param("id") id: number) {
		return { id };
	}
}
