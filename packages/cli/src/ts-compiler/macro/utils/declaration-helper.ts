import { ScopeHelper } from "@thestarweb/ts-helper";
import {
	ClassDeclaration,
	isDecorator,
	MethodDeclaration,
	ModifierLike,
	PropertyDeclaration,
} from "typescript";
import { shouldRemove } from "./side-check.js";
import { SiteOnlyConfigRule } from "../types.js";

export function shouldRemoveAsDeclaration(
	currentSide: StarFrameworkSide[],
	rule: SiteOnlyConfigRule[],
	node: MethodDeclaration | PropertyDeclaration | ClassDeclaration,
	type:
		| "whenMethodDeclaration"
		| "whenPropertyDeclaration"
		| "whenClassDecorator",
	scopeHelper: ScopeHelper,
) {
	const removeDecorator = new Set<ModifierLike>();
	const res = node.modifiers
		?.map((m) => {
			if (isDecorator(m)) {
				const res = shouldRemove(
					currentSide,
					rule,
					scopeHelper.parseExpression(m.expression),
				);
				if (res) {
					const item = res.raw[type] || res.raw.whenDecorator;
					if (item && item.enable !== false) {
						if (item.alwaysRemoveSelf) removeDecorator.add(m);
						return res;
					}
				}
			}
			return null;
		})
		.filter(Boolean)
		.sort((a, b) => (b!.importent || 0) - (a!.importent || 0));
	if (res?.length) {
		return {
			shouldRemove: res[0]!.shouldRemove,
			rawRule: res[0]!.raw,
			toRel: res[0]!.toRel,
			newDecorator: node.modifiers?.filter((i) => !removeDecorator.has(i)),
		};
	}
	return {
		shouldRemove: false as const,
		rawRule: null,
		toRel: () => undefined,
		newDecorator: node.modifiers?.filter((i) => !removeDecorator.has(i)),
	};
}
