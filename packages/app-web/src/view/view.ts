import { Get } from "@thestarweb/star-framework-route";
import { IRender } from "./render/render.js";
import { AddInterceptor } from "../interceptor/index.js";
import { ResponseWithMeta } from "../return-types/response-with-meta.js";

export function View(path: string, render: IRender): MethodDecorator {
	return function (target, propertyKey, descriptor) {
		Get(path)(target, propertyKey, descriptor);
		AddInterceptor(async (req, next) => {
			const { data, ...meta } = await next(req);
			const html = await render.renderToString?.(data);
			return new ResponseWithMeta(html, {
				...meta,
				header: { "content-type": "text/html", ...meta.header },
			});
		})(target, propertyKey, descriptor);
	};
}
