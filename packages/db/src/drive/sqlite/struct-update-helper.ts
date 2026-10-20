import { StructUpdateSqlBuildWithNoHierarchy } from "../../structure/struct-update-sql-build.js";
import { DBDifferenceType, DBTableDifference } from "../../types/schema.js";

export class StructUpdateHelper extends StructUpdateSqlBuildWithNoHierarchy {
	handleTable(def: DBTableDifference): void {
		if (def.columns.some((i) => i.changeType === DBDifferenceType.CHANGED)) {
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
		} else {
			super.handleTable(def);
		}
	}
}
