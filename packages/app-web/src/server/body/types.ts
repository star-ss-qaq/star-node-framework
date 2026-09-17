import { ParamType } from "@thestarweb/star-framework-param-helper";

export type bodyParse = (
	header: Record<string, any>,
	paramType: ParamType,
) => ((stream: ReadableStream<Uint8Array>) => Promise<any>) | null;
