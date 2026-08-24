export class ResponseWithMeta {
	code?: number;
	header?: Record<string, string | string[]>;
	data: any;
	constructor(data: any, meta?: Partial<Omit<ResponseWithMeta, "data">>) {
		Object.assign(this, meta);
		this.data = data;
		this.__ResponseWithMetaFlag = ResponseWithMeta.__ResponseWithMetaFlag;
		Object.freeze(this);
	}
	public readonly __ResponseWithMetaFlag: string;
	private static readonly __ResponseWithMetaFlag = "ResponseWithMeta";
	static isResponseWithMeta(data: any): data is ResponseWithMeta {
		if (!data || typeof data !== "object") return false;
		return data.__ResponseWithMetaFlag === this.__ResponseWithMetaFlag;
	}
}
