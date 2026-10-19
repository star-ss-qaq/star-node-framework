import { hasDbHierarchy, IDrive } from "../drive/i-drive.js";
import { ColumnTypeConvertor } from "../types/db-type-convertor.js";
import {
	ColumnSchema,
	DBDifference,
	DBDifferenceType,
	DBSchema,
	DBTableDifference,
	InstanceSchema,
	TableSchema,
} from "../types/schema.js";
import { CommonUtils } from "../utils.js";

const defaultDataTypeMap: Required<ColumnTypeConvertor> = {
	string: (col) => (col.length ? `VARCHAR(${col.length})` : "TEXT"),
	number: "REAL",
	int: "INT",
	"int-datetime": "INT",
};

export class StructHelper<T extends boolean> {
	constructor(
		private schema: InstanceSchema,
		private drive: IDrive<T>,
		private helper: CommonUtils<T>,
	) {}
	private _getColDbType(col: ColumnSchema) {
		const t = defaultDataTypeMap[col.type];
		if (typeof t === "function") return t(col);
		return t;
	}
	private _getDbTableDef(db: DBSchema, table: TableSchema, isExist: boolean) {
		const columns: DBTableDifference["columns"] = Object.entries(
			table.columns,
		).map(([k, s]) => ({
			name: s.name!,
			type: this._getColDbType(s),
			change: DBDifferenceType.CHANGED,
			nullable: s.nullable || false,
			defaultValue: this.helper.handleCodeValueToDb(s, s.defaultValue),
			baseSql: `\`${s.name}\` ${this._getColDbType(s)}`,
		}));
		const ret: DBTableDifference = {
			name: table.name!,
			type: table.type || "default",
			change: DBDifferenceType.ADDED,
			columns,
			createSql: `CREATE TABLE \`${table.name}\` (${columns.map((i) => i.baseSql).join(",")})`,
		};
		if (isExist) {
			const DBSchema = this.drive.getDBTableSchema(table.name!, db as any);
			ret.change =
				DBSchema.type === ret.type
					? DBDifferenceType.NONE
					: DBDifferenceType.CHANGED;
			columns.forEach((col, index) => {
				const dbColIndex = DBSchema.columns.findIndex(
					(dbCol) => col.name === dbCol.name,
				);
				if (dbColIndex !== -1) {
					const dbConfig = DBSchema.columns[dbColIndex];
					if (dbConfig.type !== col.type || dbConfig.name !== col.name) {
						col.change = DBDifferenceType.CHANGED;
					}
				}
			});
		}
		return ret;
	}
	private _getDbDef(db: DBSchema, exist: boolean): DBDifference {
		const existTables = new Set(exist ? this.drive.showTables(db as any) : []);
		return {
			name: db.name!,
			change: exist ? DBDifferenceType.NONE : DBDifferenceType.ADDED,
			tables: Object.values(db.tables).map((tableSchema) =>
				this._getDbTableDef(
					db,
					tableSchema,
					existTables.has(tableSchema.name!),
				),
			),
		};
	}
	private _getAllDef() {
		if (hasDbHierarchy(this.drive)) {
			const existDb = new Set(this.drive.showDatabases());
			return Object.values(this.schema.database).map((s) =>
				this._getDbDef(s, existDb.has(s.name!)),
			);
		} else {
			return [
				this._getDbDef(this.schema.database[this.schema.defaultDatabase], true),
			];
		}
	}
	getDbUpdateSql() {
		return this.drive.getUpdateSql(this._getAllDef());
	}
}
