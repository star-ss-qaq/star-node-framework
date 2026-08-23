import { execSync } from "child_process";
import { join } from "path";

export function loadProjects() {
	const projects: { name: string; version: string; location: string }[] =
		JSON.parse(
			execSync("npx lerna list --long --all --json", {
				encoding: "utf-8",
				stdio: "pipe",
			}),
		);
	return projects;
}

export function getProjectAliasObj() {
	const projects = loadProjects();
	return Object.fromEntries(
		projects.map((i) => [i.name, join(i.location, "src/index.ts")]),
	);
}
