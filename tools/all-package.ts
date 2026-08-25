import { execSync } from "child_process";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

interface ProjectInfo {
	name: string;
	version: string;
	location: string;
}
export function loadProjects(): ProjectInfo[] {
	const filePath = join(
		dirname(fileURLToPath(import.meta.url)),
		"..",
		"node_modules",
		".sf-tmp",
		"projects.json",
	);
	try {
		return JSON.parse(readFileSync(filePath, "utf-8"));
	} catch {}
	const projects: ProjectInfo[] = JSON.parse(
		execSync("npx lerna list --long --all --json", {
			encoding: "utf-8",
			stdio: "pipe",
		}),
	);
	mkdirSync(dirname(filePath), { recursive: true });
	writeFileSync(filePath, JSON.stringify(projects));
	return projects;
}

export function getProjectAliasObj() {
	const projects = loadProjects();
	return Object.fromEntries(
		projects.map((i) => [i.name, join(i.location, "src/index.ts")]),
	);
}
