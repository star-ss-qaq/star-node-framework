import { Readable } from "stream";
import { parse } from "qs";
import { parseRoutes } from "@thestarweb/star-framework-route";
import { paramMeta } from "../../params/index.js";
export interface ServerInstance {
	onRequert: (
		method: string,
		url: string | URL,
		header: any,
		body?: Readable,
	) => Promise<
		| {
				header: any;
				res: Readable;
		  }
		| undefined
	>;
}

export function createServerInstance(object: any) {
	const routes = parseRoutes(object);
	const ins: ServerInstance = {
		async onRequert(method, url, reqHeader, body) {
			method = method.toLocaleLowerCase();
			const urlObj =
				typeof url === "string" ? new URL(url, "http://127.0.0.1/") : url;
			const route = routes(method, urlObj.pathname);
			if (route) {
				let body: null;
				if (reqHeader["content-type"]) {
				}
				const data = await paramMeta.call(route.obj, route.method, {
					body: null,
					header: reqHeader,
					query: parse(urlObj.search),
				});
				const header: any = {};
				let res: Readable;
				if (data instanceof Readable) {
					res = data;
				} else {
					header["content-type"] = "application/json";
					res = Readable.from(JSON.stringify(data));
				}
				return {
					header,
					res,
				};
			}
		},
	};
	return ins;
}
