import { ColumnSchema, ColumnType, IndexType, TableType } from "./schema.js";

export type TableTypeConvertor = {
	[k in TableType]: string;
};
export type ColumnTypeConvertor = {
	[k in ColumnType]?: string | ((s: ColumnSchema) => string);
};

export type IndexTypeConvertor = {
	[k in IndexType]?: string;
};
