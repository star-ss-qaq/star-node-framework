export type ColumnType = "number" | "int" | "string" | "int-datetime";
export type TableType = "default" | "mem";
export type IndexType = "index" | "unique" | "full-text";

export interface ColumnSchema {
	name?: string;
	type: ColumnType;
	length?: number;
	defaultValue?: any;
	/**
	 * @default false
	 */
	nullable?: boolean;
	autoIncrement?: boolean;
}
export interface TableSchema {
	name?: string;
	type?: TableType;
	columns: {
		[fieldName: string]: ColumnSchema;
	};
	primaryKey?: string | string[];
	indexes?: (
		| string
		| { type?: IndexType; columns: string | string[]; name?: string }
	)[];
}
export interface DBSchema {
	name?: string;
	tables: Record<string, TableSchema>;
}

export interface InstanceSchema {
	database: Record<string, DBSchema>;
	defaultDatabase: string;
}

export interface InDBColumnSchema extends Required<
	Omit<ColumnSchema, "type" | "length">
> {
	type: string;
}
export interface InDBIndexSchema {
	name: string;
	type: string;
	columns: string[];
}

export interface InDBTableSchema {
	name: string;
	type: string;
	columns: InDBColumnSchema[];
	indexes: InDBIndexSchema[];
	primaryKey: string[];
}
export enum DBDifferenceType {
	NONE = 0,
	ADDED = 1,
	REMOVED = 2,
	CHANGED = 3,
}

export interface DBColumnDifference extends InDBColumnSchema {
	changeType: DBDifferenceType;
	changeKey: (keyof InDBColumnSchema)[];
	currentInDbSchema?: InDBColumnSchema;
}
export interface DBIndexDifference extends InDBIndexSchema {
	changeType: DBDifferenceType;
}

export interface DBTableDifference {
	name: string;
	type: string;
	changeType: DBDifferenceType;
	changeKey: ("type" | "primaryKey")[];
	currentInDbSchema?: InDBTableSchema;
	columns: DBColumnDifference[];
	indexes: DBIndexDifference[];
	primaryKey: string[];
}

export interface DBDifference {
	name: string;
	change: DBDifferenceType;
	tables: DBTableDifference[];
}
