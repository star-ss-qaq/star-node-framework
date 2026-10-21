import { InstanceSchema, TableSchema } from "../schema.js";
import { ResolveColumnTSType } from "./column.js";
import { WithAlias } from "./common.js";
import { GetDatabasesName } from "./db.js";

type GetTablesNameByDatabaseName<
	T extends InstanceSchema,
	db extends GetDatabasesName<T>,
> = {
	[k in keyof T["database"][db]["tables"]]: k extends string ? k : never;
}[keyof T["database"][db]["tables"]];

type GetAllTableNamesWithDatabaseName<T extends InstanceSchema> = {
	[k in GetDatabasesName<T>]: `${k}.${GetTablesNameByDatabaseName<T, k>}`;
}[GetDatabasesName<T>];

export type GetAllTableNames<T extends InstanceSchema> =
	| GetAllTableNamesWithDatabaseName<T>
	| (T["defaultDatabase"] extends GetDatabasesName<T>
			? GetTablesNameByDatabaseName<T, T["defaultDatabase"]>
			: never);

export type GetAllTableNamesWithAlias<T extends InstanceSchema> =
	| GetAllTableNames<T>
	| WithAlias<GetAllTableNames<T>>;

// type RTableInfo<
// 	S extends InstanceSchema,
// 	DB extends keyof S["database"] & string,
// 	TABLE extends keyof S["database"][DB]["tables"] & string,
// > = { db: DB; table: TABLE; schema: S };

type GetTableColumnsType<S extends TableSchema> = {
	[k in keyof S["columns"]]: ResolveColumnTSType<S["columns"][k]>;
};
type GetTableColumnsTypeForInset<S extends TableSchema> = Partial<
	GetTableColumnsType<S>
> &
	Pick<
		GetTableColumnsType<S>,
		{
			[k in keyof S["columns"]]: S["columns"][k]["nullable"] extends true
				? never
				: "defaultValue" extends keyof S["columns"][k]
					? never
					: S["columns"][k]["autoIncrement"] extends true
						? never
						: k;
		}[keyof S["columns"]]
	>;

// type ParseTableInfo<
// 	T extends { db: string; table: string; schema: InstanceSchema },
// > =
// 	T extends RTableInfo<infer S, infer DB, infer TABLE>
// 		? {
// 				path: `${DB}.${TABLE}`;
// 				fieldsTypes: GetTableColumnsType<S["database"][DB]["tables"][TABLE]>;
// 			}
// 		: never;

export type RelTableInfo<
	S extends InstanceSchema,
	DB extends string,
	TABLE extends string,
> = {
	db: DB;
	table: TABLE;
	path: `${DB}.${TABLE}`;
	schema: S["database"][DB]["tables"][TABLE];
	fieldsTypes: GetTableColumnsType<S["database"][DB]["tables"][TABLE]>;
	fieldsInsertTypes: GetTableColumnsTypeForInset<
		S["database"][DB]["tables"][TABLE]
	>;
};
export type VTableInfo = { fieldsTypes: Record<string, any> };
export type TableInfo<
	S extends InstanceSchema,
	DB extends string,
	TABLE extends string,
> = RelTableInfo<S, DB, TABLE> | VTableInfo;
export type TableInfoWithNameMap<
	S extends InstanceSchema,
	DB extends string,
	TABLE extends string,
> = Record<string, TableInfo<S, DB, TABLE>>;

export type ResolveTableInfo<
	S extends InstanceSchema,
	NAME extends string,
> = NAME extends `${infer DB}.${infer TABLE}`
	? RelTableInfo<S, DB, TABLE>
	: S["defaultDatabase"] extends GetDatabasesName<S>
		? RelTableInfo<S, S["defaultDatabase"], NAME>
		: never;

export type ResolveTableInfoWithAlias<
	S extends InstanceSchema,
	NAME extends string,
> = NAME extends `${infer RAW} as ${infer ALIAS}`
	? { [k in ALIAS]: ResolveTableInfo<S, RAW> }
	: ResolveTableInfo<S, NAME> extends RelTableInfo<any, any, infer T>
		? { [k in T]: ResolveTableInfo<S, NAME> }
		: never;

// type ResolveTableByTableName<
// 	T extends InstanceSchema,
// 	NAME extends ParseTableInfo<T, any>,
// > = NAME extends {}
// 	? T["database"][NAME["db"]]["tables"][NAME["table"]]
// 	: never;
