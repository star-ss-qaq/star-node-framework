import { ResponseWithMeta } from "../return-types/response-with-meta.js";
import { CallProp } from "../runtime/type.js";

export type InterceptorFn = (
	req: CallProp,
	next: (req: CallProp) => ResponseWithMeta | Promise<ResponseWithMeta>,
) => ResponseWithMeta | Promise<ResponseWithMeta>;

export type Interceptor = InterceptorFn;
