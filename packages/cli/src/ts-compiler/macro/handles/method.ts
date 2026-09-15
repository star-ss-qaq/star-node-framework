import { SiteOnlyConfigRule, TypeVisitor } from "../types.js";
import { MethodDeclaration } from "typescript";
import { shouldRemoveAsDeclaration } from "../utils/declaration-helper.js";
import { removeMethod } from "../utils/remove-method.js";

export function createMethodHandle(
	rules: SiteOnlyConfigRule[],
): TypeVisitor<MethodDeclaration> | undefined {
	const filterRule = rules.filter((i) => {
		const rule = i.whenMethodDeclaration || i.whenDecorator;
		return rule && rule.enable !== false;
	});
	if (filterRule.length > 0) {
		return (currentSide, node, factory, scopeHelper) => {
			const t = shouldRemoveAsDeclaration(
				currentSide,
				filterRule,
				node,
				"whenMethodDeclaration",
				scopeHelper,
			);
			if (t.shouldRemove) {
				const config = t.rawRule.whenMethodDeclaration;
				const removeMode = config?.removeMode
					? t.toRel(config.removeMode)
					: undefined;
				return removeMethod(removeMode || "all", node, factory, t.newDecorator);
			} else if (t.newDecorator?.length != node.modifiers?.length) {
				return factory.updateMethodDeclaration(
					node,
					t.newDecorator,
					node.asteriskToken,
					node.name,
					node.questionToken,
					node.typeParameters,
					node.parameters,
					node.type,
					node.body,
				);
			}
			return node;
		};
	}
	return;
}
