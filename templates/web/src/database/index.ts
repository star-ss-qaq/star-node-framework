import { join } from "node:path";
import { SFDB } from "@thestarweb/star-framework-db";

export const db = new SFDB(
	{
		database: {
			default: {
				tables: {
					user: {
						columns: {
							id: {
								type: "int",
								autoIncrement: true,
							},
							name: { type: "string" },
						},
					},
				},
			},
		},
		defaultDatabase: "default" as const,
	},
	{ type: "sqlite", file: join(process.cwd(), "./db.sqlite") },
);
SFSideSwitch({
	server: await db.structHelper.update(),
});
