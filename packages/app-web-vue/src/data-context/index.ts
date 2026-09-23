import { type RenderDataContext } from "@thestarweb/star-framework-app-web";
import { provideRequest } from "./request.js";
import { App } from "vue";
import { provideRoute } from "./route.js";

export * from "./context-helper.js";
export * from "./route.js";
export * from "./request.js";
export * from "./base-url.js";

export function provideSystemContext(context: RenderDataContext, app: App) {
	[provideRoute, provideRequest].forEach((fn) => fn(context, app));
}
