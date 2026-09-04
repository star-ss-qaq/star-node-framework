import { ResponseWithMeta } from "../return-types/response-with-meta.js";
import { CallProp } from "../server/types.js";

export type Interceptor = (
	req: CallProp,
	next: (req: CallProp) => ResponseWithMeta | Promise<ResponseWithMeta>,
) => ResponseWithMeta | Promise<ResponseWithMeta>;
