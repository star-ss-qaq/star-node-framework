import { ParamType, ParamTypeEnum } from "./types.js";

export function dumpTypeNameBase(type: ParamType): string {
	return Object.keys(ParamTypeEnum).find(
		(k) => (ParamTypeEnum[k as any] as any) === type.type,
	)!;
}
