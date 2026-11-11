import { StructUpdateSqlBuildWithHierarchy } from "../../structure/struct-update-sql-build.js";

export class StructUpdateHelper extends StructUpdateSqlBuildWithHierarchy {
	autoIncrementKeyWorld = "AUTO_INCREMENT";
	constructor(
		...prop: ConstructorParameters<typeof StructUpdateSqlBuildWithHierarchy>
	) {
		super(...prop);
	}
}
