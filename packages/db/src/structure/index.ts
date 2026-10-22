import { hasDbHierarchy, IDrive } from "../drive/i-drive.js";
import { QueryRunner } from "../query-runner/index.js";
import {
	ColumnTypeConvertor,
	IndexTypeConvertor,
} from "../types/db-type-convertor.js";
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
const defaultIndexTypeMap: IndexTypeConvertor = {
	index: "INDEX",
	unique: "UNIQUE INDEX",
};
const tableChangeKey: DBTableDifference["changeKey"] = ["type"];
const colCheckKey: DBColumnDifference["changeKey"] = [
	"type",
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
		const defIndexType = defaultIndexTypeMap["index"] || "";
		const indexes: DBTableDifference["indexes"] =
			table.indexes
				?.map((i) => {
					return typeof i === "string"
						? {
								name: "",
								type: defIndexType,
								columns: [table.columns[i].name!],
								changeType: DBDifferenceType.ADDED,
							}
						: {
								name: i.name || "",
								type: i.type
									? (this.drive.indexTypeConvertor?.[i.type] ??
										defaultIndexTypeMap[i.type]!)
									: defIndexType,
								columns:
									typeof i.columns === "string"
										? [table.columns[i.columns].name!]
										: i.columns.map((k) => table.columns[k].name!),
								changeType: DBDifferenceType.ADDED,
							};
				})
				.filter((i) => i.type) || [];
		const ret: DBTableDifference = {
			name: table.name!,
			type: table.type || "default",
			changeType: DBDifferenceType.ADDED,
			changeKey: [],
			columns,
			indexes,
			primaryKey: table.primaryKey
				? typeof table.primaryKey === "string"
					? [table.columns[table.primaryKey].name!]
					: table.primaryKey.map((k) => table.columns[k].name!)
				: [],
		};
		if (isExist) {
			const DBSchema = await queryRunner.getDBTableSchema(
				table.name!,
				db as any,
			);
			ret.currentInDbSchema = DBSchema;
			const changeKey = tableChangeKey.filter((k) => DBSchema[k] !== ret[k]);
			if (
				ret.primaryKey.length !== DBSchema.primaryKey.length ||
				ret.primaryKey.some((i) => !DBSchema.primaryKey.includes(i))
			) {
				changeKey.push("primaryKey");
			}
			if (changeKey.length > 0) {
				ret.changeType = DBDifferenceType.CHANGED;
				ret.changeKey = changeKey;
			} else {
				ret.changeType = DBDifferenceType.NONE;
			}
			const usedColumns = new Set();
			columns.forEach((col, index) => {
				const dbColIndex = DBSchema.columns.findIndex(
					(dbCol) => col.name === dbCol.name,
				);
				if (dbColIndex !== -1) {
					const dbCol = DBSchema.columns[dbColIndex];
					usedColumns.add(dbCol);
					col.currentInDbSchema = dbCol;
					const changeKey = colCheckKey.filter((k) => dbCol[k] !== col[k]);
					if (
						dbCol.defaultValue !== col.defaultValue &&
						String(dbCol.defaultValue) !== String(col.defaultValue)
					) {
						changeKey.push("defaultValue");
					}
					if (changeKey.length > 0) {
						col.changeType = DBDifferenceType.CHANGED;
						col.changeKey = changeKey;
					} else {
						col.changeType = DBDifferenceType.NONE;
					}
				}
			});
			DBSchema.columns.forEach((i) => {
				if (!usedColumns.has(i)) {
					columns.unshift({
						...i,
						changeType: DBDifferenceType.REMOVED,
						changeKey: [],
					});
				}
			});
			const usedIndex = new Set();
			indexes.forEach((i) => {
				if (i.name) {
					const dbIndex = DBSchema.indexes.find((j) => i.name === j.name);
					if (dbIndex) {
						usedIndex.add(dbIndex);
						i.changeType =
							dbIndex.type === i.type &&
							i.columns.length === dbIndex.columns.length &&
							i.columns.every((c, index) => dbIndex.columns[index] === c)
								? DBDifferenceType.NONE
								: DBDifferenceType.CHANGED;
					}
				} else {
					const dbIndex = DBSchema.indexes.find(
						(j) =>
							!usedIndex.has(i) &&
							j.type === i.type &&
							i.columns.length === j.columns.length &&
							i.columns.every((c, index) => j.columns[index] === c),
					);
					if (dbIndex) {
						usedIndex.add(dbIndex);
						i.name = dbIndex.name;
						i.changeType = DBDifferenceType.NONE;
					}
				}
			});
			DBSchema.indexes.forEach((i) => {
				if (!usedIndex.has(i)) {
					indexes.push({ ...i, changeType: DBDifferenceType.REMOVED });
				}
			});
		}
		indexes.forEach((i) => {
			if (!i.name) {
				i.name = `idx_${table.name}_${i.columns.join("_")}_${Date.now()}`;
			}
		});
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
	/**
	 * 自动更绝结构描述更新数据库
	 *
	 * **警告** 由于缺少验证，尤其缺少在不同数据库中的验证，且不同数据、数据库驱动版本可能存在差异，该方法可能无法正常工作，且**可能导致数据丢失**
	 *
	 * **严禁在生产环境使用**，请使用getDbUpdateSql并检查确认无误后手动执行
	 */
	async update() {
		using queryRunner = await this.drive.createQueryRunner();
		await this.drive.applyChange(
			queryRunner,
			await this._getAllDef(queryRunner),
		);
	}
}
