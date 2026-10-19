import { IDrive } from "../../drive/i-drive.js";
import { QueryRunner } from "../../query-runner/index.js";
import { GetAllTableNamesWithAlias } from "../../types/helpers/table.js";
import {
	ColumnSchema,
	ColumnType,
	InstanceSchema,
} from "../../types/schema.js";
import { CommonUtils } from "../../utils.js";
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

export class QueryBuilderUtils<DB_HIERARCHY extends boolean> {
	constructor(
		private readonly schema: InstanceSchema,
		private readonly drive: IDrive<DB_HIERARCHY>,
		public readonly commonUtils: CommonUtils<DB_HIERARCHY>,
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
						relName: this.drive.noDbHierarchy
							? `\`${tableSchema.name}\``
							: `\`${dbSchema.name}\`.\`${tableSchema.name}\``,
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
}
export { And, Or, Raw, Column, Value } from "./where.js";
