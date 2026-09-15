import { SiteOnlyConfigRule, TypeVisitor } from "../types.js";
import { PropertyDeclaration } from "typescript";
import { shouldRemoveAsDeclaration } from "../utils/declaration-helper.js";

export function createPropertyHandle(
	rules: SiteOnlyConfigRule[],
): TypeVisitor<PropertyDeclaration> | undefined {
	const filterRule = rules.filter((i) => {
		const rule = i.whenPropertyDeclaration || i.whenDecorator;
		return rule && rule.enable !== false;
	});
	if (filterRule.length > 0) {
		return (currentSide, node, factory, scopeHelper) => {
			const t = shouldRemoveAsDeclaration(
				currentSide,
				filterRule,
				node,
				"whenPropertyDeclaration",
				scopeHelper,
			);
			if (t.shouldRemove) {
				return [];
			} else if (t.newDecorator?.length != node.modifiers?.length) {
				return factory.updatePropertyDeclaration(
					node,
					t.newDecorator,
					node.name,
					node.questionToken || node.exclamationToken,
					node.type,
					node.initializer,
				);
			}
			return node;
		};
	}
	return;
}
