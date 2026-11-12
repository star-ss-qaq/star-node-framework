import { readFile } from "fs/promises";

const info = {
	name: "sf-web",
	version: "1.0.0",
};
try {
	const pJson = JSON.parse(await readFile("package.json", "utf-8"));
	pJson.name && (info.name = pJson.name);
	pJson.version && (info.version = pJson.version);
} catch {}
export { info };
