import { CallExpression, SyntaxKind } from "typescript";
import { SiteOnlyConfigRule, TypeVisitor } from "../types.js";
import { shouldRemove } from "../utils/side-check.js";

export function createCallExpressionHandle(
	rules: SiteOnlyConfigRule[],
): TypeVisitor<CallExpression> | undefined {
	const filterRule = rules.filter((i) => i.whenCallExpression);
	if (filterRule.length > 0) {
		return (currentSide, node, factory, scopeHelper) => {
			const res = shouldRemove(
				currentSide,
				filterRule,
				scopeHelper.parseExpression(node),
			);
			if (res?.shouldRemove) {
				const config = res.raw.whenCallExpression!;
				const mode = res.toRel(config.mode);
				switch (mode) {
					case "customize":
						return config.customizeHandle!(node, currentSide, factory) || node;
					case "remove":
						// 神奇的ts，null是Expression可以使用，但是undefined不行
						return factory.createNull();
					case "replace":
					// TODO
				}
			}
			return node;
		};
	}
	return;
}
