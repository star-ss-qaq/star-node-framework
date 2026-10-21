import { StructUpdateSqlBuildWithNoHierarchy } from "../../structure/struct-update-sql-build.js";
import {
	DBDifferenceType,
	DBIndexDifference,
	DBTableDifference,
} from "../../types/schema.js";

export class StructUpdateHelper extends StructUpdateSqlBuildWithNoHierarchy {
	handleTable(def: DBTableDifference): void {
		if (def.columns.some((i) => i.changeType === DBDifferenceType.CHANGED)) {
			def.indexes
				.filter((i) => i.changeType !== DBDifferenceType.ADDED)
				.forEach((i) => this.handleRemoveIndex(i, def));
			this.handleChangeTable(def);
			def.indexes
				.filter((i) => i.changeType !== DBDifferenceType.REMOVED)
				.forEach((i) => this.handleAddIndex(i, def));
		} else {
			super.handleTable(def);
		}
	}
	handleCreateTable(def: DBTableDifference) {
		const fields = def.columns.map((i) => this.handleColumnBase(i, def));
		fields.push(`PRIMARY KEY(${def.primaryKey.map((i) => `\`${i}\``)})`);
		this.exec(`CREATE TABLE \`${def.name}\` (${fields.join(",")})`);
	}
	handleChangeTable(def: DBTableDifference) {
		const tempName = `temp_${Date.now()}_${Math.floor(Math.random() * 100)}`;
		this.exec(
			`ALTER TABLE \`${def.currentInDbSchema!.name}\` RENAME TO \`${tempName}\``,
		);
		this.handleCreateTable(def);
		const existCol = def.columns.filter(
			(i) =>
				i.changeType === DBDifferenceType.CHANGED ||
				i.changeType === DBDifferenceType.NONE,
		);
		this.exec(
			`INSERT INTO \`${def.name}\`(${existCol.map((i) => `\`${i.name}\``).join(",")}) SELECT ${existCol.map((i) => `\`${i.currentInDbSchema?.name || i.name}\``).join(",")} FROM \`${tempName}\``,
		);
		this.exec(`DROP TABLE \`${tempName}\``);
	}
}
