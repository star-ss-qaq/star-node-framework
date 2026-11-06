import { type Readable } from "stream";
import type { loadPackage } from "./package-loader/index.js";

export interface ServerRuntimeContext {
	root: string;
	static: string;
	indexHtml: string;
}

export interface RequestContext {
	prefix?: string;
}

export interface ServerInstance {
	onRequest: (
		method: string,
		url: string | URL,
		header: any,
		body: ReadableStream<Uint8Array>,
		context: RequestContext,
	) => Promise<
		| {
				code: number;
				header: any;
				res: Readable | ReadableStream<Uint8Array> | null;
		  }
		| undefined
	>;
}

export interface ResolvedServerInstanceConfig extends ServerInstance {
	readonly prefix?: string | ((url: URL) => string);
	readonly if?: (url: URL) => boolean;
	readonly important?: number;
	readonly staticFilePath?: string;
}
export interface OldInlineInstanceConfig {
	package: {
		instances: ServerInstance;
		root: string;
		static: string;
		indexHtml: string;
	};
	prefix?: string | ((url: URL) => string);
	if?: (url: URL) => boolean;
	important?: number;
}

export type InlineServer =
	| ResolvedServerInstanceConfig
	| OldInlineInstanceConfig;
export type ServerInstanceConfig =
	| InlineServer
	| Parameters<typeof loadPackage>[0];

export interface ServerConfig {
	instances: ServerInstanceConfig[];
	port: number;
}

interface PackageInfoV1 {
	"sf-formate": "1";
	name: string;
	version: string;
	buildAt: number;
	server: {
		dir: string;
		main: string;
	};
	browser: {
		dir: string;
	};
}
export type PackageInfo = PackageInfoV1;
