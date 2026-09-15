import {
	parseExpressionToValue,
	ScopeHelper,
	type ScopeVar,
	ScopeVarType,
} from "@thestarweb/ts-helper";
import { Expression, isCallExpression, NodeArray } from "typescript";
import { FromArg, FromArgWithSelf, SiteOnlyConfigRule } from "../types.js";
import { findRule } from "./find-rule.js";

export function isKeepInSide<T, F>(
	currentSide: StarFrameworkSide[],
	reqSide: StarFrameworkSide | StarFrameworkSide[],
	type: "exclude" | "include" | "SFSiteOnly" | "SFSiteOmit",
	keepValue: T = true as any,
	omitValue: F = false as any,
) {
	const isMatchSide = Array.isArray(reqSide)
		? reqSide.some((i) => currentSide.includes(i))
		: currentSide.includes(reqSide);
	// include且isMatchSide时或exclude且!isMatchSide
	const isKeep = isMatchSide !== (type === "exclude" || type === "SFSiteOmit");
	return isKeep ? keepValue : omitValue;
}
export function shouldRemove(
	currentSide: StarFrameworkSide[],
	filterRule: SiteOnlyConfigRule[],
	v: ScopeVar,
) {
	const args: NodeArray<Expression>[] = [];
	const toRel = <T extends FromArgWithSelf<any>>(
		a: T,
	): T extends FromArg<infer R> ? R : T => {
		if (a && typeof a === "object" && "arg" in a) {
			const { arg } = a;
			if (Array.isArray(arg)) {
				return (
					parseExpressionToValue(args[arg[0]][arg[1]]) ||
					(a as FromArg<any>).default
				);
			}
			return (
				parseExpressionToValue(args[0][arg as number]) ||
				(a as FromArg<any>).default
			);
		}
		return a as any;
	};
	let t = v;
	while (t.type === ScopeVarType.FunctionReturn) {
		const { rawExpression, bindScope } = t;
		args.push(t.rawExpression.arguments);
		t = bindScope.parseExpression(rawExpression.expression);
	}
	const item = findRule(filterRule, t);
	if (item) {
		const reqSide = toRel(item.side);
		const shouldRemove = isKeepInSide(
			currentSide,
			reqSide,
			item.type || "exclude",
			false,
			true,
		);
		return {
			importent: item.importent || 0,
			shouldRemove,
			raw: item,
			toRel,
		};
	}
}
