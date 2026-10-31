import { type RenderDataContext } from "@thestarweb/star-framework-app-web";
import { provideRequest } from "./request.js";
import { provideRoute } from "./route.js";
import { ReactNode } from "react";
import { provideBaseUrl } from "./base-url.js";

export * from "./context-helper.js";
export * from "./route.js";
export * from "./request.js";
export * from "./base-url.js";

export function provideContext(
	context: RenderDataContext,
	app: ReactNode,
) {
	return [provideBaseUrl, provideRoute, provideRequest].reduce(
		(node, fn) => fn(context, node),
		app,
	);
}
