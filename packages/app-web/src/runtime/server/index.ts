import { PassThrough, Readable } from "stream";
import { parse } from "qs";
import { parseRoutes } from "@thestarweb/star-framework-route";
import { paramMeta } from "../../params/index.js";
import { ResponseWithMeta } from "../../return-types/index.js";
import { PassThroughReadable } from "../utils/pass-through-readable.js";
import { getInterceptors, Interceptor } from "../../interceptor/index.js";
import { CallProp } from "../type.js";
export interface ServerInstance {
	onRequert: (
		method: string,
		url: string | URL,
		header: any,
		body?: Readable,
	) => Promise<
		| {
				code: number;
				header: any;
				res: Readable | null;
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
				let body = null;
				if (reqHeader["content-type"]) {
				}

				const interceptors: Interceptor[] = route.allObj
					.map((obj) => getInterceptors(obj))
					.flat();
				interceptors.push(...getInterceptors(route.obj, route.method));
				const handle = interceptors.reduceRight<
					(prop: CallProp) => ResponseWithMeta | Promise<ResponseWithMeta>
				>(
					(next, handle) => (req) => handle(req, next),
					async (req: CallProp) => {
						const rawData = await paramMeta.call(route.obj, route.method, req);
						return ResponseWithMeta.isResponseWithMeta(rawData)
							? rawData
							: new ResponseWithMeta(rawData);
					},
				);
				const {
					data,
					code = 200,
					header = {},
				} = await handle({
					body,
					header: reqHeader,
					query: parse(urlObj.search),
				});
				let res: Readable | null;
				if (data instanceof Readable) {
					res = data;
				} else if (data instanceof PassThrough) {
					res = new PassThroughReadable(data);
				} else if (data === null || typeof data === "undefined") {
					res = null;
				} else if (header["content-type"]?.includes?.("text")) {
					res = Readable.from(data?.toString() || "");
				} else {
					if (!header["content-type"]) {
						header["content-type"] = "application/json";
					}
					res = Readable.from(JSON.stringify(data));
				}
				return {
					code,
					header,
					res,
				};
			}
		},
	};
	return ins;
}
