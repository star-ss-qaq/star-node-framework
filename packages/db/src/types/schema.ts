export type ColumnType = "number" | "int" | "string" | "int-datetime";
export type TableType = "default" | "mem";

export interface ColumnSchema {
	name?: string;
	type: ColumnType;
	length?: number;
	defaultValue?: any;
	/**
	 * @default false
	 */
	nullable?: boolean;
}
export interface TableSchema {
	name?: string;
	type?: TableType;
	columns: {
		[fieldName: string]: ColumnSchema;
	};
}
export interface DBSchema {
	name?: string;
	tables: Record<string, TableSchema>;
}

export interface InstanceSchema {
	database: Record<string, DBSchema>;
	defaultDatabase: string;
}

export interface DBTableSchema {
	type: string;
	columns: { name: string; type: string }[];
}
export enum DBDifferenceType {
	NONE = 0,
	ADDED = 1,
	REMOVED = 2,
	CHANGED = 3,
}

export interface DBColumnDifference {
	name: string;
	type: string;
	change: DBDifferenceType;
	baseSql: string;
	defaultValue?: any;
	nullable: boolean;
}

export interface DBTableDifference {
	name: string;
	type: string;
	change: DBDifferenceType;
	createSql: string;
	columns: DBColumnDifference[];
}

export interface DBDifference {
	name: string;
	change: DBDifferenceType;
	tables: DBTableDifference[];
}
