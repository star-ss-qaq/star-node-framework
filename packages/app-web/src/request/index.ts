import { SFWebRequest } from "./types.js";
export { SFWebRequest } from "./types.js";

let request: SFWebRequest | undefined;
export function getSfRequest() {
	if (!request) {
		throw new Error(
			"request还未初始化，只有在主程序加载完成后才能调用request。如主程序已经完成加载，请检查是否正确",
		);
	}
	return request;
}
export function setSfRequest(request2: SFWebRequest) {
	request = request2;
}
