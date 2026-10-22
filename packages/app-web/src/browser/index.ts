import { parseRoute } from "../route/index.js";
import { clientRender } from "../view/index.js";

export function createBrowserInstance(object: any) {
	const routes = parseRoute(object);
	clientRender(routes);
}
