import { StringKeyOf } from "@thestarweb/ts-helper";
import { UnionToIntersection } from "../../query-build/types.js";
import { ColumnSchema } from "../schema.js";
import { WithAlias } from "./common.js";
import { TableInfoWithNameMap } from "./table.js";

type ColumnTypeToTSType = {
	number: number;
	int: number;
	string: string;
	"int-datetime": Date;
};

export type ResolveColumnTSType<T extends ColumnSchema> =
	T["type"] extends keyof ColumnTypeToTSType
		?
				| ColumnTypeToTSType[T["type"]]
				| (T["nullable"] extends true ? null : never)
		: any;

export type AllColumnWithType<T extends TableInfoWithNameMap<any, any, any>> =
	UnionToIntersection<
		{
			[k in StringKeyOf<T>]:
				| (Omit<T, k>[keyof Omit<T, k>]["fieldsTypes"] extends never
						? T[k]["fieldsTypes"]
						: Omit<
								T[k]["fieldsTypes"],
								keyof Omit<T, k>[keyof Omit<T, k>]["fieldsTypes"]
							>)
				| {
						[fk in StringKeyOf<T[k]["fieldsTypes"]>]: {
							[kk in `${k}.${fk}`]: T[k]["fieldsTypes"][fk];
						};
				  }[StringKeyOf<T[k]["fieldsTypes"]>];
		}[StringKeyOf<T>]
	> & {};

export type AllColumnNoWildcard<T extends TableInfoWithNameMap<any, any, any>> =
	StringKeyOf<AllColumnWithType<T>>;

export type AllColumn<T extends TableInfoWithNameMap<any, any, any>> =
	| AllColumnNoWildcard<T>
	| "*"
	| {
			[k in keyof T]: k extends string ? `${k}.*` : never;
	  }[keyof T];
export type AllColumnWithAlias<T extends TableInfoWithNameMap<any, any, any>> =
	| AllColumn<T>
	| WithAlias<AllColumnNoWildcard<T>>;

type ParseFieldInfo_AllField<
	TABLES extends TableInfoWithNameMap<any, any, any>,
> = {
	[t in keyof TABLES]: TABLES[t]["fieldsTypes"];
}[keyof TABLES];
export type ParseFieldInfo<
	TABLES extends TableInfoWithNameMap<any, any, any>,
	C extends AllColumnWithAlias<TABLES>,
> = C extends "*"
	? ParseFieldInfo_AllField<TABLES>
	: C extends `${infer TABLE}.${infer COL} as ${infer A}`
		? { [k in A]: TABLES[TABLE]["fieldsTypes"][COL] }
		: C extends `${infer TABLE}.*`
			? TABLES[TABLE]["fieldsTypes"]
			: C extends `${infer TABLE}.${infer COL}`
				? { [k in COL]: TABLES[TABLE]["fieldsTypes"][COL] }
				: C extends `${infer COL} as ${infer A}`
					? {
							[k in A]: ParseFieldInfo_AllField<TABLES>[COL];
						}
					: { [k in C]: ParseFieldInfo_AllField<TABLES>[C] };
