import { IDrive } from "../drive/i-drive.js";
import { ColumnTypeConvertor } from "../types/db-type-convertor.js";
import {
	ColumnSchema,
	DBColumnDifference,
	DBDifference,
	DBDifferenceType,
	DBIndexDifference,
	DBTableDifference,
} from "../types/schema.js";

export class StructUpdateSqlBuild {
	constructor(protected exec: (data: any) => void) {}
	protected lazeMap = new Map<string, any[]>();
	protected lazeExec(name: keyof StructUpdateSqlBuild, data: any) {
		if (!this.lazeMap.has(name)) this.lazeMap.set(name, []);
		this.lazeMap.get(name)!.push(data);
	}
	protected applyLazy(name: keyof StructUpdateSqlBuild) {
		if (this.lazeMap.has(name)) {
			this.lazeMap.get(name)!.forEach((i) => this.exec(i));
			this.lazeMap.delete(name);
		}
	}
	handleDb(diff: DBDifference) {
		switch (diff.change) {
			case DBDifferenceType.ADDED:
				this.handleCreateDB(diff);
				break;
			case DBDifferenceType.REMOVED:
				this.handleRemoveDb(diff);
				return;
		}
		this.handleSwitchDB(diff);
		diff.tables.forEach((t) => this.handleTable(t));
	}
	handleSwitchDB(diff: DBDifference) {
		this.exec(`use \`${diff.name}\``);
	}
	handleCreateDB(diff: DBDifference) {
		this.exec(`CREATE DATABASE \`${diff.name}\``);
	}
	handleRemoveDb(diff: DBDifference) {
		this.exec(`DROP DATABASE \`${diff.name}\``);
	}
	handleTable(def: DBTableDifference) {
		def.indexes.forEach(
			(i) =>
				(i.changeType === DBDifferenceType.REMOVED ||
					i.changeType === DBDifferenceType.CHANGED) &&
				this.handleRemoveIndex(i, def),
		);
		switch (def.changeType) {
			case DBDifferenceType.ADDED:
				this.handleCreateTable(def);
				break;
			case DBDifferenceType.REMOVED:
				this.handleRemoveTable(def);
				return;
			case DBDifferenceType.CHANGED:
				this.handleChangeTable(def);
			case DBDifferenceType.NONE:
				this.handleTableColumns(def);
		}
		def.indexes.forEach(
			(i) =>
				(i.changeType === DBDifferenceType.ADDED ||
					i.changeType === DBDifferenceType.CHANGED) &&
				this.handleAddIndex(i, def),
		);
	}
	handleCreateTable(def: DBTableDifference) {
		this.exec(
			`CREATE TABLE \`${def.name}\` (${def.columns.map((i) => this.handleColumnBase(i, def)).join(",")})`,
		);
		this.handleAddPrimaryKey(def);
	}
	handleRemoveTable(def: DBTableDifference) {
		this.exec(`DROP TABLE \`${def.name}\``);
	}
	handleChangeTable(def: DBTableDifference) {
		if (def.changeKey.includes("primaryKey") && def.changeKey.length === 1) {
			this.handleRemovePrimaryKey(def);
			this.handleAddPrimaryKey(def);
		} else {
			throw new Error("暂不支持对表结构进行修改");
		}
	}
	handleTableColumns(def: DBTableDifference) {
		const sorted = [...def.columns].sort((i, j) => {
			// 我们要把这里的顺序进行修改，确保最后再添加autoIncrement的列
			const a = i.autoIncrement ? Number.MAX_VALUE : def.columns.indexOf(i);
			const b = j.autoIncrement ? Number.MAX_VALUE : def.columns.indexOf(j);
			return a - b;
		});
		sorted.forEach((i) => this.handleColumn(i, def));
	}
	handleColumn(def: DBColumnDifference, tableDef: DBTableDifference) {
		switch (def.changeType) {
			case DBDifferenceType.ADDED:
				this.handleAddColumn(def, tableDef);
				return;
			case DBDifferenceType.REMOVED:
				this.handleRemoveColumn(def, tableDef);
				return;
			case DBDifferenceType.CHANGED:
				this.handleChangeColumn(def, tableDef);
				return;
		}
	}
	handleAddColumn(def: DBColumnDifference, tableDef: DBTableDifference) {
		this.exec(
			`ALTER TABLE \`${tableDef.name}\` ADD ${this.handleColumnBase(def, tableDef)}`,
		);
	}
	handleChangeColumn(def: DBColumnDifference, tableDef: DBTableDifference) {
		this.exec(
			`ALTER TABLE \`${tableDef.name}\` CHANGE \`${def.name}\` ${this.handleColumnBase(def, tableDef)}`,
		);
	}
	handleRemoveColumn(def: DBColumnDifference, tableDef: DBTableDifference) {
		this.exec(`ALTER TABLE \`${tableDef.name}\` DROP \`${def.name}\``);
	}
	handleColumnBase(def: DBColumnDifference, tableDef: DBTableDifference) {
		const res = [`\`${def.name}\` ${def.type}`];
		if (def.autoIncrement) {
			res.push("PRIMARY KEY AUTOINCREMENT");
		} else {
			if (!def.nullable) res.push("NOT");
			res.push("NULL");
			if (typeof def.defaultValue !== "undefined") {
				res.push(`DEFAULT ${JSON.stringify(def.defaultValue)}`);
			}
		}
		return res.join(" ");
	}
	handleTableIndex(def: DBTableDifference) {
		def.indexes.forEach((i) => this.handleIndex(i, def));
	}
	handleIndex(def: DBIndexDifference, tableDef: DBTableDifference) {
		switch (def.changeType) {
			case DBDifferenceType.ADDED:
				this.handleAddIndex(def, tableDef);
				return;
			case DBDifferenceType.REMOVED:
				this.handleRemoveIndex(def, tableDef);
				return;
			case DBDifferenceType.CHANGED:
				this.handleChangeIndex(def, tableDef);
				return;
		}
	}
	handleAddIndex(def: DBIndexDifference, tableDef: DBTableDifference) {
		this.exec(
			`CREATE ${def.type} \`${def.name}\` ON \`${tableDef.name}\`(${def.columns.map((c) => `\`${c}\``).join(",")})`,
		);
	}
	handleRemoveIndex(def: DBIndexDifference, tableDef: DBTableDifference) {
		this.exec(`DROP INDEX \`${def.name}\``);
	}
	handleChangeIndex(def: DBIndexDifference, tableDef: DBTableDifference) {
		this.handleRemoveIndex(def, tableDef);
		this.handleAddIndex(def, tableDef);
	}
	handleAddPrimaryKey(def: DBTableDifference) {
		if (def.primaryKey.length > 0) {
			this.exec(
				`ALTER TABLE \`${def.name}\` ADD CONSTRAINT \`p_key\` PRIMARY KEY (${def.primaryKey.map((c) => `\`${c}\``).join(",")})`,
			);
		}
	}
	handleRemovePrimaryKey(def: DBTableDifference) {
		if (def.currentInDbSchema?.primaryKey.length) {
			this.exec(`ALTER TABLE \`${def.name}\` DROP PRIMARY KEY`);
		}
	}
}
export class StructUpdateSqlBuildWithNoHierarchy extends StructUpdateSqlBuild {
	constructor(diff: DBDifference[], exec: (data: any) => void) {
		super(exec);
		diff.forEach((i) => i.tables.forEach((j) => this.handleTable(j)));
	}
}
export class StructUpdateSqlBuildWithHierarchy extends StructUpdateSqlBuild {
	constructor(diff: DBDifference[], exec: (data: any) => void) {
		super(exec);
		diff.forEach((i) => this.handleDb(i));
	}
}
export function defaultDBDifferenceToSql(
	diff: DBDifference[],
	Builder: new (
		diff: DBDifference[],
		exec: (data: any) => void,
	) => any = StructUpdateSqlBuildWithHierarchy,
) {
	const res: any[] = [];
	new Builder(diff, res.push.bind(res));
	return res.join(";\n");
}
export function defaultDBDifferenceApply(
	diff: DBDifference[],
	exec: (sql: any) => Promise<any>,
	Builder: new (
		diff: DBDifference[],
		exec: (data: any) => void,
	) => any = StructUpdateSqlBuildWithHierarchy,
) {
	let p: Promise<any> = Promise.resolve();
	new Builder(diff, (prop) => (p = p.then(() => exec(prop))));
	return p;
}
