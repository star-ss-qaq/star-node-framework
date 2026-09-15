import { SiteOnlyConfigRule, TypeVisitor } from "../types.js";
import { ClassDeclaration } from "typescript";
import { shouldRemoveAsDeclaration } from "../utils/declaration-helper.js";

export function createClassHandle(
	rules: SiteOnlyConfigRule[],
): TypeVisitor<ClassDeclaration> | undefined {
	const filterRule = rules.filter((i) => {
		const rule = i.whenClassDecorator || i.whenDecorator;
		return rule && rule.enable !== false;
	});
	if (filterRule.length > 0) {
		return (currentSide, node, factory, scopeHelper) => {
			const t = shouldRemoveAsDeclaration(
				currentSide,
				filterRule,
				node,
				"whenClassDecorator",
				scopeHelper,
			);
			if (t.shouldRemove) {
				return factory.updateClassDeclaration(
					node,
					t.newDecorator,
					node.name,
					node.typeParameters,
					node.heritageClauses,
					[],
				);
			} else if (t.newDecorator?.length != node.modifiers?.length) {
				return factory.updateClassDeclaration(
					node,
					t.newDecorator,
					node.name,
					node.typeParameters,
					node.heritageClauses,
					node.members,
				);
			}
			return node;
		};
	}
	return undefined;
}
