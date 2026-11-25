export interface ServerRuntimeContext {
	root: string;
	static: string;
	indexHtml: string;
	innerCall: (prop: RequestProp) => Promise<ResponseData>;
}

export interface RequestContext {
	prefix: string;
}

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "WS" | "OPTION";

export interface RequestProp {
	ip: string;
	port: number;
	method: Method;
	url: URL;
	header: any;
	body: ReadableStream<Uint8Array>;
	context: RequestContext;
	signal: AbortSignal;
	appName?: string;
}
export interface ResponseData {
	code: number;
	header: any;
	data: ReadableStream<Uint8Array> | null;
}

export interface ResolvedServerInstance {
	readonly matchRequest: {
		host?: RegExp;
		prefix?: RegExp;
		ip?: RegExp;
	};
	readonly important?: number;
	readonly staticFilePath?: string;
	readonly name: string;
	onRequest: (prop: RequestProp) => Promise<ResponseData>;
	destroy?(): void;
}
