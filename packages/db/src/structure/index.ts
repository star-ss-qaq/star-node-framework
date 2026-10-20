import { hasDbHierarchy, IDrive } from "../drive/i-drive.js";
import { QueryRunner } from "../query-runner/index.js";
import { ColumnTypeConvertor } from "../types/db-type-convertor.js";
import {
	ColumnSchema,
	DBColumnDifference,
	DBDifference,
	DBDifferenceType,
	DBSchema,
	DBTableDifference,
	InDBColumnSchema,
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
const tableChangeKey: DBTableDifference["changeKey"] = ["type"];
const colCheckKey: DBColumnDifference["changeKey"] = [
	"type",
	"defaultValue",
	"nullable",
	"name",
	"autoIncrement",
];

export class StructHelper<T extends boolean> {
	constructor(
		private schema: InstanceSchema,
		private drive: IDrive<T>,
		private helper: CommonUtils<T>,
	) {}
	private _getColDbType(col: ColumnSchema) {
		const t =
			this.drive.columnTypeConvertor?.[col.type] ??
			defaultDataTypeMap[col.type];
		if (typeof t === "function") return t(col);
		return t;
	}
	private async _getDbTableDef(
		queryRunner: QueryRunner,
		db: DBSchema,
		table: TableSchema,
		isExist: boolean,
	) {
		const columns: DBTableDifference["columns"] = Object.entries(
			table.columns,
		).map(([k, s]) => ({
			name: s.name!,
			type: this._getColDbType(s),
			changeType: DBDifferenceType.ADDED,
			changeKey: [],
			nullable: s.nullable || false,
			autoIncrement: s.autoIncrement || false,
			defaultValue: this.helper.handleCodeValueToDb(s, s.defaultValue),
		}));
		const ret: DBTableDifference = {
			name: table.name!,
			type: table.type || "default",
			changeType: DBDifferenceType.ADDED,
			changeKey: [],
			columns,
		};
		if (isExist) {
			const DBSchema = await queryRunner.getDBTableSchema(
				table.name!,
				db as any,
			);
			ret.currentInDbSchema = DBSchema;
			const changeKey = tableChangeKey.filter((k) => DBSchema[k] !== ret[k]);
			if (changeKey.length > 0) {
				ret.changeType = DBDifferenceType.CHANGED;
				ret.changeKey = changeKey;
			} else {
				ret.changeType = DBDifferenceType.NONE;
			}
			columns.forEach((col, index) => {
				const dbColIndex = DBSchema.columns.findIndex(
					(dbCol) => col.name === dbCol.name,
				);
				if (dbColIndex !== -1) {
					const dbConfig = DBSchema.columns[dbColIndex];
					col.currentInDbSchema = dbConfig;
					const changeKey = colCheckKey.filter((k) => dbConfig[k] !== col[k]);
					if (changeKey.length > 0) {
						col.changeType = DBDifferenceType.CHANGED;
						col.changeKey = changeKey;
					} else {
						col.changeType = DBDifferenceType.NONE;
					}
				}
			});
		}
		return ret;
	}
	private async _getDbDef(
		queryRunner: QueryRunner,
		db: DBSchema,
		exist: boolean,
	): Promise<DBDifference> {
		const existTables = new Set(
			exist ? await queryRunner.showTables(db.name!) : [],
		);
		return {
			name: db.name!,
			change: exist ? DBDifferenceType.NONE : DBDifferenceType.ADDED,
			tables: await Promise.all(
				Object.values(db.tables).map((tableSchema) =>
					this._getDbTableDef(
						queryRunner,
						db,
						tableSchema,
						existTables.has(tableSchema.name!),
					),
				),
			),
		};
	}
	private async _getAllDef(queryRunner: QueryRunner) {
		if (hasDbHierarchy(this.drive)) {
			const existDb = new Set(queryRunner.showDatabases());
			return await Promise.all(
				Object.values(this.schema.database).map((s) =>
					this._getDbDef(queryRunner, s, existDb.has(s.name!)),
				),
			);
		} else {
			return [
				await this._getDbDef(
					queryRunner,
					this.schema.database[this.schema.defaultDatabase],
					true,
				),
			];
		}
	}
	async getDbUpdateSql() {
		using queryRunner = await this.drive.createQueryRunner();
		return this.drive.getUpdateSql(await this._getAllDef(queryRunner));
	}
	async update() {
		using queryRunner = await this.drive.createQueryRunner();
		await this.drive.applyChange(
			queryRunner,
			await this._getAllDef(queryRunner),
		);
	}
}
