import { SiteOnlyConfigRule, TypeVisitor } from "../types.js";
import { TypeReferenceNode } from "typescript";
import { shouldRemoveAsDeclaration } from "../utils/declaration-helper.js";
import { shouldRemove } from "../utils/side-check.js";
import { findRule } from "../utils/find-rule.js";

export function createTypeReferenceNodeHandle(
	rules: SiteOnlyConfigRule[],
): TypeVisitor<TypeReferenceNode> | undefined {
	const filterRule = rules.filter(
		(i) => i.whenTypeReferenceNode,
	) as SiteOnlyConfigRule[];
	if (filterRule.length > 0) {
		return (currentSide, node, factory, scopeHelper) => {
			const res = shouldRemove(
				currentSide,
				filterRule,
				scopeHelper.parseExpression(node.typeName),
			);
			if (res?.shouldRemove) {
				const config = res.raw.whenTypeReferenceNode!;
				switch (config.mode) {
					case "customize":
						return config.customizeHandle!(node, currentSide, factory) || node;
				}
			}
			return node;
		};
	}
	return;
}
