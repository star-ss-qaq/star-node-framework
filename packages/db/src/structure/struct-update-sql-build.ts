import { IDrive } from "../drive/i-drive.js";
import { ColumnTypeConvertor } from "../types/db-type-convertor.js";
import {
	ColumnSchema,
	DBColumnDifference,
	DBDifference,
	DBDifferenceType,
	DBTableDifference,
} from "../types/schema.js";

export class StructUpdateSqlBuild {
	constructor(private exec: (data: any) => void) {}
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
		switch (def.change) {
			case DBDifferenceType.ADDED:
				this.handleCreateTable(def);
				return;
			case DBDifferenceType.REMOVED:
				this.handleRemoveTable(def);
				return;
			case DBDifferenceType.CHANGED:
				this.handleChangeTable(def);
		}
		def.columns.forEach((i) => this.handleColumn(i, def));
	}
	handleCreateTable(def: DBTableDifference) {
		this.exec(
			`CREATE TABLE \`${def.name}\` (${def.columns.map((i) => this.handleColumnBase(i, def)).join(",")})`,
		);
	}
	handleRemoveTable(def: DBTableDifference) {
		this.exec(`DROP TABLE \`${def.name}\``);
	}
	handleChangeTable(def: DBTableDifference) {
		throw new Error("暂不支持对表结构进行修改");
	}
	handleColumn(def: DBColumnDifference, tableDef: DBTableDifference) {
		switch (def.change) {
			case DBDifferenceType.ADDED:
				this.handleColumnAdd(def, tableDef);
				return;
			case DBDifferenceType.REMOVED:
				this.handleColumnRemove(def, tableDef);
				return;
			case DBDifferenceType.CHANGED:
				this.handleColumnChange(def, tableDef);
				return;
		}
	}
	handleColumnAdd(def: DBColumnDifference, tableDef: DBTableDifference) {
		this.exec(
			`ALTER TABLE \`${tableDef.name}\` ADD ${this.handleColumnBase(def, tableDef)}`,
		);
	}
	handleColumnChange(def: DBColumnDifference, tableDef: DBTableDifference) {
		this.exec(
			`ALTER TABLE \`${tableDef.name}\` CHANGE \`${def.name}\` ${this.handleColumnBase(def, tableDef)}`,
		);
	}
	handleColumnRemove(def: DBColumnDifference, tableDef: DBTableDifference) {
		this.exec(`ALTER TABLE \`${tableDef.name}\` DROP \`${def.name}\``);
	}
	handleColumnBase(def: DBColumnDifference, tableDef: DBTableDifference) {
		const res = [`\`${def.name}\` ${def.type}`];
		if (!def.nullable) res.push("NOT");
		res.push("NULL");
		if (typeof def.defaultValue !== "undefined") {
			res.push(`DEFAULT ${JSON.stringify(def.defaultValue)}`);
		}
		return res.join(" ");
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
