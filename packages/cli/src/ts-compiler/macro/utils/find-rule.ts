import { type ScopeVar, ScopeVarType } from "@thestarweb/ts-helper";
import { SiteOnlyConfigRule } from "../types.js";

export function findRule<T extends SiteOnlyConfigRule>(rule: T[], v: ScopeVar) {
	if (v.type === ScopeVarType.Import) {
		const { filePath, varPath } = v;
		const name = varPath.join(".") || "*";
		return rule.find(
			(r) =>
				(Array.isArray(r.import)
					? r.import.includes(filePath)
					: r.import === filePath) &&
				(Array.isArray(r.name) ? r.name.includes(name) : r.name === name),
		);
	}
}
