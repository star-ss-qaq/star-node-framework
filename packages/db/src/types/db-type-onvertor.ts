import { ColumnSchema, ColumnType, TableType } from "./schema.js";

export type TableTypeConvertor = {
	[k in TableType]: string;
};
export type ColumnTypeConvertor = {
	[k in ColumnType]?: string | ((s: ColumnSchema) => string);
};
