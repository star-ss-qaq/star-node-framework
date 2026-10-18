import { InstanceSchema } from "../../src/types/schema.js";

export const baseSchema = {
	defaultDatabase: "test" as const,
	database: {
		test: {
			tables: {
				user: {
					columns: {
						id: { type: "number" },
						name: { type: "string" },
						createTime: { type: "int-datetime" },
						lastLoginTime: {
							type: "int-datetime",
							defaultValue: 0,
							nullable: true,
						},
					},
				},
				userData: {
					columns: {
						uid: { type: "number" },
						data: { type: "string" },
					},
				},
			},
		},
	},
} satisfies InstanceSchema;
