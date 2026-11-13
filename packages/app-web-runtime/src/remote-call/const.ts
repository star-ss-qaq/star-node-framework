import { Method } from "../index.js";

export const MethodToCode: Record<Method, number> = {
	GET: 1,
	POST: 2,
	PUT: 3,
	DELETE: 4,
	OPTION: 5,
	WS: 11,
};
export const MethodCodeToMethod = Object.fromEntries(
	Object.entries(MethodToCode).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof MethodToCode>;
export enum MessageType {
	NewRequest = 11,
	StartResponse = 21,
}
