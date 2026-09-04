import { parseRoute } from "../route/index.js";
import { clientRender } from "../view/index.js";

export function createBrowsweInstance(object: any) {
	const routes = parseRoute(object);
	clientRender(routes);
}
