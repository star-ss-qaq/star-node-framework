import { IDrive } from "../drive/i-drive.js";
import {
	GetAllTableNamesWithAlias,
	ResolveTableInfo,
	ResolveTableInfoWithAlias,
} from "../types/helpers/table.js";
import { InstanceSchema } from "../types/schema.js";
import { CommonUtils } from "../utils.js";
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

export class QueryBuild<
	DB_HIERARCHY extends boolean,
	S extends InstanceSchema,
> {
	private utils: QueryBuilderUtils<DB_HIERARCHY>;
	constructor(
		private readonly schema: S,
		drive: IDrive<DB_HIERARCHY>,
		commonUtils: CommonUtils<DB_HIERARCHY>,
	) {
		this.utils = new QueryBuilderUtils<DB_HIERARCHY>(
			schema,
			drive,
			commonUtils,
		);
	}

	select<TABLE extends AnyTableInput<S>>(t: TABLE) {
		return new SelectQueryBuild<
			DB_HIERARCHY,
			S,
			ResolveAnyTableInfoWithAlias<S, TABLE>
		>(this.utils, this.utils.resolveTable(t));
	}
	insert<TABLE extends GetAllTableNamesWithAlias<S>>(t: TABLE) {
		return new InsertQueryBuild<DB_HIERARCHY, S, ResolveTableInfo<S, TABLE>>(
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
		return new DeleteQueryBuild<
			DB_HIERARCHY,
			S,
			ResolveAnyTableInfoWithAlias<S, TABLE>
		>(this.utils, this.utils.resolveRelTable(t));
	}
}

export { And, Or, Raw, Column, Value } from "./utils/index.js";
