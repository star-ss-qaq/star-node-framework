import { ParamType, ParamTypeEnum } from "./types.js";

export function dumpTSType(type: ParamType): string {
	switch (type.type) {
		case ParamTypeEnum.Any:
			return "any";
		case ParamTypeEnum.AnyOf:
			return type.anyOf.map((t) => `(${dumpTSType(t)})`).join("|");
		case ParamTypeEnum.String:
			return "string";
		case ParamTypeEnum.Number:
		case ParamTypeEnum.Int:
			return "number";
		case ParamTypeEnum.BigInt:
			return "BigInt";
		case ParamTypeEnum.Boolean:
			return "boolean";
		case ParamTypeEnum.Enum:
			return type.values.map((t) => JSON.stringify(t)).join("|");

		case ParamTypeEnum.Array:
			return Array.isArray(type.items)
				? `[${type.items.map(dumpTSType).join(", ")}]`
				: `${dumpTSType(type.items)}[]`;
		case ParamTypeEnum.Object:
			return `{${Object.keys(type.properties)
				.map(
					(k) =>
						`${JSON.stringify(k)}${type.required.includes(k) ? "" : "?"}: ${dumpTSType(type.properties[k])},`,
				)
				.join(
					"",
				)}${type.additionalProperties ? `[k:string]:${dumpTSType(type.additionalProperties)}` : ""}}`;
		case ParamTypeEnum.RawClass:
			return "any";
	}
	return "any";
}
