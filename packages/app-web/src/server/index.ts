import { PassThrough, Readable } from "stream";
import { parse } from "qs";
import { paramMeta } from "../params/index.js";
import { ResponseWithMeta } from "../return-types/index.js";
import { PassThroughReadable } from "./utils/pass-through-readable.js";
import { getInterceptors, Interceptor } from "../interceptor/index.js";
import { parseRoute } from "../route/index.js";
import { createServerRender } from "../view/utils/index.js";
import { CallProp } from "./types.js";
import {
	ServerInstance,
	ServerRuntimeContext,
} from "@thestarweb/star-framework-web-runtime-node";
import { Method } from "../route/types.js";
import { JSONBody } from "./body/json.js";

export function createServerFactory(object: any) {
	const handles = [JSONBody];
	return (context: ServerRuntimeContext) => {
		const routes = parseRoute(object);
		const serverRender = createServerRender(context);
		const ins: ServerInstance = {
			async onRequert(method, url, reqHeader, rawBody, context) {
				const urlObj =
					typeof url === "string" ? new URL(url, "http://127.0.0.1/") : url;
				const route = routes(method as Method, urlObj.pathname);

				const interceptors: Interceptor[] = route.allRoute.flatMap((info) =>
					getInterceptors(info.obj),
				);

				interceptors.unshift(serverRender);

				let body: any = null;
				let call: (
					prop: CallProp,
				) => ResponseWithMeta | Promise<ResponseWithMeta> = () =>
					new ResponseWithMeta(null, { code: 404 });

				if (route.finalRoute) {
					const { obj, propertyKey } = route.finalRoute;

					interceptors.push(...getInterceptors(obj, propertyKey));

					const paramType = paramMeta.getParamMetadata(obj, propertyKey);
					if (paramType.types.body) {
						for (const h of handles) {
							const handle = h(reqHeader, paramType.types.body.type);
							if (handle) {
								body = await handle(rawBody);
								break;
							}
						}
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
					method: method as Method,
					route,
				});
				let res: ReadableStream | Readable | null;
				if (data instanceof ReadableStream) {
					res = data;
				} else if (data instanceof TransformStream) {
					res = data.readable;
				} else if (data instanceof Readable) {
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
			// @ts-ignore
			_rawObject: object,
		};
		return ins;
	};
}
