import { PassThrough, Readable } from "stream";
import { parse } from "qs";
import { paramMeta } from "../params/index.js";
import { ResponseWithMeta } from "../return-types/index.js";
import { getInterceptors, Interceptor } from "../interceptor/index.js";
import { parseRoute } from "../route/index.js";
import { createServerRender } from "../view/utils/index.js";
import { CallProp } from "./types.js";
import {
	RequestProp,
	ServerInstance,
	ServerRuntimeContext,
} from "@thestarweb/star-framework-web-runtime";
import { Method } from "../route/types.js";
import { JSONBody } from "./body/json.js";
import { setSfRequest } from "../request/index.js";
import { ServerSideRequest } from "../request/server.js";
import {
	mergeAbortSignal,
	setRequestAbortSignalFn,
} from "../abort-signal/index.js";
import {
	getRequestAbortSignal,
	runWithSignal,
} from "../abort-signal/server.js";

const textEncoder = new TextEncoder();

export function createServerFactory(object: any) {
	setRequestAbortSignalFn(getRequestAbortSignal);
	const handles = [JSONBody];
	return (context: ServerRuntimeContext) => {
		const routes = parseRoute(object);
		const serverRender = createServerRender(context);
		const ins: ServerInstance = {
			async onRequest({
				method,
				url,
				header: reqHeader,
				body: rawBody,
				signal,
				ip,
				context,
			}: RequestProp) {
				const ctrl = new AbortController();
				try {
					return await runWithSignal(
						mergeAbortSignal(signal, ctrl.signal),
						async () => {
							const urlObj =
								typeof url === "string"
									? new URL(url, "http://127.0.0.1/")
									: url;
							const route = routes(method as Method, urlObj.pathname);

							const interceptors: Interceptor[] = route.allRoute.flatMap(
								(info) => getInterceptors(info.obj),
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

								if (typeof (obj as any)[propertyKey] === "function") {
									const paramType = paramMeta.getParamMetadata(
										obj,
										propertyKey,
									);
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
								} else {
									call = () => new ResponseWithMeta((obj as any)[propertyKey]);
								}
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
								query: parse(urlObj.search.substring(1)),
								url: urlObj,
								method: method as Method,
								route,
								param: route.params,
								context: { ...context, ip },
							});
							let res: ReadableStream | null;
							if (data instanceof ReadableStream) {
								res = data;
							} else if (data instanceof TransformStream) {
								res = data.readable;
							} else if (data instanceof Readable) {
								res = Readable.toWeb(data) as ReadableStream;
							} else if (data instanceof PassThrough) {
								res = Readable.toWeb(data) as ReadableStream;
							} else if (data === null || typeof data === "undefined") {
								res = null;
							} else if (header["content-type"]?.includes?.("text")) {
								res = new ReadableStream({
									start(ctrl) {
										ctrl.enqueue(textEncoder.encode(data?.toString() || ""));
										ctrl.close();
									},
								});
							} else {
								if (!header["content-type"]) {
									header["content-type"] = "application/json";
								}
								res = new ReadableStream({
									start(ctrl) {
										ctrl.enqueue(textEncoder.encode(JSON.stringify(data)));
										ctrl.close();
									},
								});
							}
							return {
								code,
								header,
								data: res,
							};
						},
					);
				} finally {
					ctrl.abort();
				}
			},
			// @ts-ignore
			_rawObject: object,
		};
		setSfRequest(new ServerSideRequest(ins, context.innerCall));
		return ins;
	};
}
