export interface ServerRuntimeContext {
	root: string;
	static: string;
	indexHtml: string;
}

export interface RequestContext {
	prefix?: string;
}

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "WS" | "OPTION";

export interface RequestProp {
	method: Method;
	url: URL;
	header: any;
	body: ReadableStream<Uint8Array>;
	context: RequestContext;
}
export interface ResponseData {
	code: number;
	header: any;
	res: ReadableStream<Uint8Array> | null;
}

export interface ResolvedServerInstance {
	readonly matchRequest:{
		host?: RegExp,
		prefix?: RegExp,
		ip?: RegExp,
	}
	readonly important?: number;
	readonly staticFilePath?: string;
	readonly name: string;
	onRequest: (prop: RequestProp) => Promise<ResponseData>;
	destroy?(): void;
}
