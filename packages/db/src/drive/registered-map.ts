import { IDrive } from "./i-drive.js";
import { TestOnlyDrive } from "./test-only.js";

export const RegisteredDriveMap = {
	"test-only": TestOnlyDrive,
} satisfies {
	[k in string]: new (config: { type: k; [ok: string]: any }) => IDrive;
};
