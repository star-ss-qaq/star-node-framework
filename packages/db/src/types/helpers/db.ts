import { InstanceSchema } from "../schema.js";

export type GetDatabasesName<T extends InstanceSchema> = {
	[k in keyof T["database"]]: k extends string ? k : never;
}[keyof T["database"]];
