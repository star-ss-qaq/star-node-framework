import { getRequestAbortSignal } from "../abort-signal/browser.js";
import { setRequestAbortSignalFn } from "../abort-signal/index.js";
import { parseRoute } from "../route/index.js";
import { clientRender } from "../view/index.js";

export function createBrowserInstance(object: any) {
	setRequestAbortSignalFn(getRequestAbortSignal);
	const routes = parseRoute(object);
	clientRender(routes);
}
