import { type Readable } from "stream";

export interface ServerRuntimeContext {
	root: string;
	static: string;
	indexHtml: string;
}
export interface ParsedPackage extends ServerRuntimeContext {
	instances: ServerInstance;
}

export interface ServerInstanceConfig {
	package: string | ParsedPackage;
	prefix?: string | ((url: URL) => string);
	if?: (url: URL) => boolean;
	importent?: number;
}
export interface ServerConfig {
	instances: ServerInstanceConfig[];
	port: number;
}

export interface RequestContext {
	prefix?: string;
}

export interface ServerInstance {
	onRequert: (
		method: string,
		url: string | URL,
		header: any,
		body: Readable,
		context: RequestContext,
	) => Promise<
		| {
				code: number;
				header: any;
				res: Readable | ReadableStream | null;
		  }
		| undefined
	>;
}

interface PackageInfoV1 {
	"sf-fomate": "1";
	name: string;
	version: string;
	server: {
		dir: string;
		main: string;
	};
	browser: {
		dir: string;
	};
}
export type PackageInfo = PackageInfoV1;
