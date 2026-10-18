import { IDrive } from "../drive/i-drive.js";
import {
	GetAllTableNamesWithAlias,
	ResolveTableInfo,
	ResolveTableInfoWithAlias,
} from "../types/helpers/table.js";
import { InstanceSchema } from "../types/schema.js";
import { DeleteQueryBuild } from "./delete-sql-builder.js";
import { InsertQueryBuild } from "./insert-sql-builder.js";
import { SelectQueryBuild } from "./select-sql-builder.js";
import {
	AnyTableInput,
	ResolveAnyTableInfoWithAlias,
	TableInfoInCode,
} from "./types.js";
import { UpdateQueryBuild } from "./update-sql-builder.js";
import { QueryBuilderUtils } from "./utils/index.js";

export class QueryBuild<S extends InstanceSchema> {
	private utils: QueryBuilderUtils;
	constructor(
		private readonly schema: S,
		drive: IDrive,
	) {
		this.utils = new QueryBuilderUtils(schema, drive);
	}

	select<TABLE extends AnyTableInput<S>>(t: TABLE) {
		return new SelectQueryBuild<S, ResolveAnyTableInfoWithAlias<S, TABLE>>(
			this.utils,
			this.utils.resolveTable(t),
		);
	}
	insert<TABLE extends GetAllTableNamesWithAlias<S>>(t: TABLE) {
		return new InsertQueryBuild<S, ResolveTableInfo<S, TABLE>>(
			this.utils,
			this.utils.resolveRelTable(t),
		);
	}
	update<TABLE extends GetAllTableNamesWithAlias<S>>(t: TABLE) {
		return new UpdateQueryBuild<S, ResolveAnyTableInfoWithAlias<S, TABLE>>(
			this.utils,
			this.utils.resolveRelTable(t),
		);
	}
	delete<TABLE extends GetAllTableNamesWithAlias<S>>(t: TABLE) {
		return new DeleteQueryBuild<S, ResolveAnyTableInfoWithAlias<S, TABLE>>(
			this.utils,
			this.utils.resolveRelTable(t),
		);
	}
}

export { And, Or, Raw, Column, Value } from "./utils/index.js";
