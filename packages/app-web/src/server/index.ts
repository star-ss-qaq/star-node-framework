import { PassThrough, Readable } from "stream";
import { parse } from "qs";
import { paramMeta } from "../params/index.js";
import { ResponseWithMeta } from "../return-types/index.js";
import { PassThroughReadable } from "./utils/pass-through-readable.js";
import { getInterceptors, Interceptor } from "../interceptor/index.js";
import { ServerInstance } from "../runtime/type.js";
import { parseRoute } from "../route/index.js";
import { serverRender } from "../view/get-render/index.js";
import { CallProp } from "./types.js";

export function createServerInstance(object: any) {
	const routes = parseRoute(object);
	const globalInterceptor: Interceptor[] = [];
	const ins: ServerInstance = {
		async onRequert(method, url, reqHeader, rawBody) {
			const urlObj =
				typeof url === "string" ? new URL(url, "http://127.0.0.1/") : url;
			const route = routes(method, urlObj.pathname);

			const interceptors: Interceptor[] = route.allRoute.flatMap((info) =>
				getInterceptors(info.obj),
			);
			interceptors.unshift(...globalInterceptor, serverRender);

			let body: any = null;
			let call: (
				prop: CallProp,
			) => ResponseWithMeta | Promise<ResponseWithMeta> = () =>
				new ResponseWithMeta(null, { code: 404 });

			if (route.finalRoute) {
				const { obj, propertyKey } = route.finalRoute;

				interceptors.push(...getInterceptors(obj, propertyKey));

				if (reqHeader["content-type"]) {
				}

				call = async (req: CallProp) => {
					const rawData = await paramMeta.call(obj, propertyKey, req);
					return ResponseWithMeta.isResponseWithMeta(rawData)
						? rawData
						: new ResponseWithMeta(rawData);
				};
			}

			const handle = interceptors.reduceRight<
				(prop: CallProp) => ResponseWithMeta | Promise<ResponseWithMeta>
			>((next, handle) => (req) => handle(req, next), call);
			const {
				data,
				code = 200,
				header = {},
			} = await handle({
				body,
				header: reqHeader,
				query: parse(urlObj.search),
				url: urlObj,
				method,
				route,
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
		},
		addGlobalInterceptor(i) {
			globalInterceptor.push(i);
		},
	};
	return ins;
}
