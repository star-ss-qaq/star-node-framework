import { StringKeyOf } from "@thestarweb/ts-helper";
import { AllColumnWithType } from "../../types/helpers/column.js";
import { TableInfoWithNameMap } from "../../types/helpers/table.js";
import { SQL, TableFieldsAndName, TableInfoInCode } from "../types.js";
import { getTableFieldsAndName } from "./common.js";
import { ColumnSchema } from "../../types/schema.js";
import { QueryBuilderUtils } from "./index.js";

type BaseWhereTypeString = "=" | ">" | ">=" | "<" | "<=" | "!=";

type FieldsRelName<T extends Record<string, any>> = { [k in keyof T]: string };
type FieldInfo = { columnSchema?: ColumnSchema };
type FieldsInfo<T extends Record<string, any>> = {
	names: FieldsRelName<T>;
	infos: { [k in keyof T]: FieldInfo };
};

type SystemTypeForTable<T extends Record<string, any>> = (
	utils: QueryBuilderUtils<any>,
	tables: FieldsInfo<T>,
) => SQL;
type SystemTypeForColumns<T extends Record<string, any>, CT> = (
	utils: QueryBuilderUtils<any>,
	tables: FieldsInfo<T>,
	colName: string,
	colUserName: string,
) => SQL;
const isSystemValueTypeFlag = Symbol();
type SystemTypeForValue<T extends Record<string, any>, CT> = ((
	utils: QueryBuilderUtils<any>,
	tables: FieldsInfo<T>,
	colName: string,
	colUserName: string,
) => SQL) & { [isSystemValueTypeFlag]: true };
function markAsSystemValueType(
	fn: (
		utils: QueryBuilderUtils<any>,
		tables: FieldsInfo<any>,
		colName: string,
		colUserName: string,
	) => SQL,
) {
	return Object.assign(fn, {
		[isSystemValueTypeFlag]: true as const,
	});
}
function isSystemValueType(fn: any): fn is SystemTypeForValue<any, any> {
	return fn[isSystemValueTypeFlag] || false;
}

type WhereConfigRaw<T extends Record<string, any>> = {
	[k in keyof T]?:
		| T[k]
		| SystemTypeForColumns<T, T[k]>
		| SystemTypeForValue<T, T[k]>;
};
export type WhereConfig<T extends Record<string, any>> =
	| WhereConfigRaw<T>
	| SystemTypeForTable<T>;

export type WhereProp<
	TABLES extends TableInfoWithNameMap<any, any, any>,
	InlineType extends Record<string, any> = {},
	DefaultField extends boolean = false,
> =
	| [
			config: WhereConfig<
				Omit<AllColumnWithType<TABLES>, keyof InlineType> & InlineType
			>,
	  ]
	| [
			field: StringKeyOf<AllColumnWithType<TABLES>> | StringKeyOf<InlineType>,
			value: DefaultField extends true
				?
						| StringKeyOf<AllColumnWithType<TABLES>>
						| SystemTypeForColumns<AllColumnWithType<TABLES>, any>
						| SystemTypeForValue<AllColumnWithType<TABLES>, any>
				: any,
	  ]
	| [
			field: StringKeyOf<AllColumnWithType<TABLES>> | StringKeyOf<InlineType>,
			option: BaseWhereTypeString,
			value: DefaultField extends true
				?
						| StringKeyOf<AllColumnWithType<TABLES>>
						| SystemTypeForValue<AllColumnWithType<TABLES>, any>
				: any,
	  ];

function mergeSql(sqls: SQL[], logic: "AND" | "OR") {
	const fSql = sqls.map((i) => i.sql).join(` ${logic} `);
	return {
		sql: sqls.length > 1 ? `(${fSql})` : fSql,
		bindings: sqls.flatMap((i) => i.bindings),
	};
}

export function buildWhereColOption(
	utils: QueryBuilderUtils<any>,
	tables: FieldsInfo<any>,
	colRelName: string,
	colUserName: string,
	op: BaseWhereTypeString,
	value: any,
	defaultColValue = false,
): SQL {
	if (typeof value === "function") {
		const v = value(utils, tables, colRelName, colUserName);
		return {
			sql: `${colRelName} ${op} ${v.sql}`,
			bindings: v.bindings,
		};
	}
	if (defaultColValue && typeof value === "string") {
		if (!tables.infos[value]) throw new Error(`Unknown field ${value}`);
		return {
			sql: `${colRelName} ${op} ${tables.names[value]}`,
			bindings: [],
		};
	}
	return {
		sql: `${colRelName} ${op} ?`,
		bindings: [
			tables.infos[colUserName].columnSchema
				? utils.commonUtils.handleCodeValueToDb(
						tables.infos[colUserName].columnSchema,
						value,
					)
				: value,
		],
	};
}

function buildWhereCol(
	utils: QueryBuilderUtils<any>,
	tables: FieldsInfo<any>,
	colRelName: string,
	colUserName: string,
	prop: any,
	defaultColValue = false,
): SQL {
	if (typeof prop === "function" && !isSystemValueType(prop)) {
		return prop(utils, tables, colRelName, colUserName);
	}
	return buildWhereColOption(
		utils,
		tables,
		colRelName,
		colUserName,
		"=",
		prop,
		defaultColValue,
	);
}
export function getTablesFieldsInfoAndRelName(
	tables: TableInfoInCode[],
	inlineTable?: TableFieldsAndName,
): FieldsInfo<any> {
	const noOverRideKeys = new Set();
	const names: FieldsRelName<any> = {};
	const infos: FieldsInfo<any>["infos"] = {};
	if (inlineTable) {
		Object.entries(inlineTable).forEach(([key, info]) => {
			noOverRideKeys.add(key);
			names[key] = info.relName;
			infos[key] = info;
		});
	}
	tables.forEach((tableInfo) => {
		const sub = getTableFieldsAndName(tableInfo);
		Object.entries(sub).forEach(([key, info]) => {
			const fullRelName = `\`${tableInfo.name}\`.\`${info.relName}\``;
			const fullFullKey = `${tableInfo.name}.${key}`;
			names[fullFullKey] = fullRelName;
			infos[fullFullKey] = info;
			if (!noOverRideKeys.has(key)) {
				if (key in names) {
					delete names[key];
					delete infos[key];
					noOverRideKeys.add(key);
				} else {
					names[key] = fullRelName;
					infos[key] = info;
				}
			}
		});
	});
	return { names, infos };
}
function buildWhereConfig(
	utils: QueryBuilderUtils<any>,
	tables: FieldsInfo<any>,
	config: WhereConfig<any>,
) {
	switch (typeof config) {
		case "function":
			return config(utils, tables);
		case "object":
			const sqls = Object.entries(config)
				.map(([k, v]) => {
					if (k in tables.infos) {
						return buildWhereCol(utils, tables, tables.names[k], k, v);
					}
				})
				.filter(Boolean) as SQL[];
			if (sqls.length > 0) {
				return mergeSql(sqls, "AND");
			}
	}
	return { sql: "1 = 1", bindings: [] };
}

export function buildWhere(
	utils: QueryBuilderUtils<any>,
	tables: FieldsInfo<any>,
	prop: WhereProp<any, any>,
	defaultColValue = false,
): SQL {
	switch (prop.length) {
		case 1:
			return buildWhereConfig(utils, tables, prop[0]);
		case 2:
			if (!(prop[0] in tables.infos)) {
				throw new Error(`Unknown column ${prop[0]}`);
			}
			return buildWhereCol(
				utils,
				tables,
				tables.names[prop[0]],
				prop[0],
				prop[1],
				defaultColValue,
			);
		case 3:
			if (!(prop[0] in tables.infos)) {
				throw new Error(`Unknown column ${prop[0]}`);
			}
			return buildWhereColOption(
				utils,
				tables,
				tables.names[prop[0]],
				prop[0],
				prop[1],
				prop[2],
				defaultColValue,
			);
	}
	throw new Error("Unknown where prop");
}

function createLogicMergeOption(logic: "AND" | "OR") {
	function LogicMerge<T extends Record<string, any>>(
		v1: T,
		...values: T[]
	): SystemTypeForTable<T>;
	function LogicMerge<T extends Record<string, any>, CT>(
		v1: CT,
		...values: CT[]
	): SystemTypeForColumns<T, CT>;
	function LogicMerge(...values: any[]) {
		return (
			utils: QueryBuilderUtils<any>,
			tables: FieldsInfo<any>,
			colRelName?: string,
			colUserName?: string,
		): SQL => {
			const fn =
				typeof colRelName === "string"
					? buildWhereCol.bind(
							undefined,
							utils,
							tables,
							colRelName,
							colUserName!,
						)
					: buildWhereConfig.bind(undefined, utils, tables);
			return mergeSql(
				values.map((i) => fn(i)),
				logic,
			);
		};
	}
	return LogicMerge;
}

export const And = createLogicMergeOption("AND");
export const Or = createLogicMergeOption("OR");
export function Raw<T extends Record<string, any>>(
	prop: string | ((tables: FieldsRelName<T>) => SQL | string),
): SystemTypeForTable<T>;
export function Raw<T extends Record<string, any>, CT>(
	prop: string | ((name: string, tables: FieldsRelName<T>) => SQL | string),
): SystemTypeForColumns<T, CT>;
export function Raw<T extends Record<string, any>>(
	prop: string | ((...prop: any[]) => SQL | string),
): SystemTypeForTable<T> {
	if (typeof prop === "string") {
		return () => {
			return { sql: prop, bindings: [] };
		};
	}
	return (
		utils: QueryBuilderUtils<any>,
		tables: FieldsInfo<T>,
		colName?: string,
	) => {
		const res = colName ? prop(colName, tables.names) : prop(tables.names);
		if (typeof res === "string") {
			return { sql: res, bindings: [] };
		}
		return res;
	};
}

export function Column<T extends Record<string, any>, CT>(
	col: keyof T,
): SystemTypeForValue<T, CT> {
	return markAsSystemValueType(function (utils, tables) {
		return { sql: tables.names[col], bindings: [] };
	});
}
export function Value<T extends Record<string, any>, CT>(
	value: CT,
): SystemTypeForValue<T, CT> {
	return markAsSystemValueType(function (utils, tables, colName, calUserName) {
		return {
			sql: "?",
			bindings: [
				tables.infos[calUserName].columnSchema
					? utils.commonUtils.handleCodeValueToDb(
							tables.infos[calUserName].columnSchema,
							value,
						)
					: value,
			],
		};
	});
}
