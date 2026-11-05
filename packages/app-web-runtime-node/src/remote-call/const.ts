export const MethodToCode: Record<string, number> = {
	GET: 1,
	POST: 2,
	PUT: 3,
	DELETE: 4,
	OPTION: 5,
};
export const MethodCodeToMethod = Object.fromEntries(
	Object.entries(MethodToCode).map(([k, v]) => [v, k]),
);
export enum MessageType {
	MessageReceived = 1,
	MessageError = 2,
	NewRequest = 11,
	RequestBodyData = 12,
	RequestBodyEnd = 13,
	RequestCancel = 14,
	StartResponse = 15,
	ResponseData = 16,
	ResponseEnd = 17,
}
