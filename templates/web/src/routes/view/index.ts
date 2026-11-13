import { HTMLRender, Layout, SubRoute, View } from "@thestarweb/star-framework-app-web";
import { Inject } from "@thestarweb/star-framework-di";
import { VueRoute } from "./vue/index.js";

@Layout(
  new HTMLRender(
    `<div>this is Layout of ViewRoute
    <a href='/view'>view</a>
    <a href='/vue'>vue</a>
    <a href='/vue/about/'>about</a>
    <a href='/vue/html1'>html1</a>
    <a href='/vue/html2'>html2</a>
    <a href='/' target="_balnk">11</a>
    <sf-route />
    </div>`,
  ),
  (meta) => ({
    ...meta,
    title: `${meta.title} - star-framework-demo`,
    htmlMeta: {
      ...meta.htmlMeta,
      author: "star_ss",
    },
  }),
)
export class ViewRoute {
  @View("", new HTMLRender("<div>this is a html for root</div>"), {
    title: "index",
  })
  index: undefined;

  @View("/view", new HTMLRender("<div>this is a html for view</div>"), {
    title: "view",
  })
  view() {}
  @Inject()
  @SubRoute("vue")
  vue!: VueRoute;
}