import { IDrive } from "../../drive/i-drive.js";
import { QueryRunner } from "../../query-runner/index.js";
import { GetAllTableNamesWithAlias } from "../../types/helpers/table.js";
import {
	ColumnSchema,
	ColumnType,
	InstanceSchema,
} from "../../types/schema.js";
import {
	AnyTableInput,
	RelTableInCode,
	SQL,
	TableFieldsAndName,
	TableInfoInCode,
} from "../types.js";
import { formatName } from "./common.js";
import {
	buildWhere,
	getTablesFieldsInfoAndRelName,
	WhereProp,
} from "./where.js";

export class QueryBuilderUtils {
	constructor(
		private readonly schema: InstanceSchema,
		private readonly drive: IDrive,
	) {}
	resolveRelTable(table: GetAllTableNamesWithAlias<any>): RelTableInCode {
		if (table) {
			const [tableWithoutAlias, alias] = table.split(" as ");
			const s = tableWithoutAlias.split(".");
			if (s.length == 1) {
				s.unshift(this.schema.defaultDatabase);
			}
			if (s.length === 2) {
				const dbSchema = this.schema.database[s[0]];
				const tableSchema = dbSchema?.tables[s[1]];
				if (tableSchema) {
					return {
						name: alias || table,
						isQuery: 0,
						db: s[0],
						table: s[1],
						dbSchema,
						tableSchema,
						relName: `\`${dbSchema.name || this.formatName(s[0])}\`.\`${tableSchema.name || this.formatName(s[1])}\``,
					};
				}
			}
		}
		throw new Error(`can not resolve table ${table}`);
	}
	resolveTable(table: AnyTableInput<any>): TableInfoInCode {
		if (typeof table === "object") {
			return { name: table[1], isQuery: 1, query: table[0] };
		}
		return this.resolveRelTable(table);
	}
	formatName = formatName;
	tableInfoToSql(info: TableInfoInCode): SQL {
		if (info.isQuery) {
			const { sql, bindings } = info.query.toSql();
			return { sql: `(${sql}) as ${info.name}`, bindings };
		}
		return {
			sql: `${info.relName} AS \`${info.name}\``,
			bindings: [],
		};
	}
	buildWhere(
		prop: WhereProp<any, any>,
		tables: TableInfoInCode[],
		inlineField?: TableFieldsAndName,
		defaultColValue?: boolean,
	) {
		return buildWhere(
			this,
			getTablesFieldsInfoAndRelName(tables, inlineField),
			prop,
			defaultColValue,
		);
	}
	handles: Partial<
		Record<
			ColumnType,
			{ toDb?: (value: any) => any; toCode?: (value: any) => any }
		>
	> = {
		"int-datetime": {
			toDb: (value: any) =>
				value && value instanceof Date
					? Math.floor(value.valueOf() / 1000)
					: value,
			toCode: (value: number) => new Date(value * 1000),
		},
	};
	handleCodeValueToDb(schema: ColumnSchema, value: any) {
		const fn = this.handles[schema.type]?.toDb;
		if (fn) {
			return fn(value);
		}
		return value;
	}
	handleDbValueToCode(schema: ColumnSchema, value: any) {
		const fn = this.handles[schema.type]?.toCode;
		if (fn) {
			return fn(value);
		}
		return value;
	}
	defaultRunner: QueryRunner | null = null;
	get queryRunner() {
		if (!this.defaultRunner) {
			this.defaultRunner = this.drive.createQueryRunner();
		}
		return this.defaultRunner;
	}
}
export { And, Or, Raw, Column, Value } from "./where.js";
