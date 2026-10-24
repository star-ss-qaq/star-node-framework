import { GetTableColumnsType } from "./helpers/table.js";
import { TableSchema } from "./schema.js";
export type GetTableDataType<S extends TableSchema> = GetTableColumnsType<S>;

export interface DBExecResult {
	changed: number;
	lastInsertRowid: any;
}

export {
	ColumnSchema,
	TableSchema,
	DBSchema,
	InstanceSchema,
} from "./schema.js";
