import { WithAlias } from "../types/helpers/common.js";
import {
	GetAllTableNamesWithAlias,
	ResolveTableInfoWithAlias,
	TableInfoWithNameMap,
} from "../types/helpers/table.js";
import {
	ColumnSchema,
	DBSchema,
	InstanceSchema,
	TableSchema,
} from "../types/schema.js";
import { SelectQueryBuild } from "./select-sql-builder.js";

export type UnionToIntersection<U> = (
	U extends any ? (k: U) => void : never
) extends (k: infer I) => void
	? I
	: never;

export interface SQL {
	sql: string;
	bindings: any[];
}
export type AnyTableInput<S extends InstanceSchema> =
	| GetAllTableNamesWithAlias<S>
	| readonly [SelectQueryBuild<any, any, any, any>, string];
export type ResolveAnyTableInfoWithAlias<
	S extends InstanceSchema,
	TABLE extends AnyTableInput<S>,
> =
	TABLE extends GetAllTableNamesWithAlias<S>
		? ResolveTableInfoWithAlias<S, TABLE>
		: TABLE extends readonly [SelectQueryBuild<any, any, any, any>, string]
			? {
					[k in TABLE[1]]: {
						fieldsTypes: Awaited<ReturnType<TABLE[0]["one"]>>;
					};
				}
			: {};
export type RelTableInCode = {
	name: string;
	isQuery: 0;
	db: string;
	table: string;
	dbSchema: DBSchema;
	tableSchema: TableSchema;
	relName: string;
};

export type TableInfoInCode =
	| RelTableInCode
	| { name: string; isQuery: 1; query: SelectQueryBuild<any, any, any, any> };

export type TableFieldsAndName = Record<
	string,
	{ readonly relName: string; readonly columnSchema?: ColumnSchema }
>;
