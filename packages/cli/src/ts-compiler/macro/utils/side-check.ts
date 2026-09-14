import {
	parseExpressionToValue,
	ScopeHelper,
	ScopeVarType,
} from "@thestarweb/ts-helper";
import { Expression, isCallExpression, NodeArray } from "typescript";
import { FromArg, FromArgWithSelf, SiteOnlyConfigRule } from "../types.js";

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
	m: Expression,
	scopeHelper: ScopeHelper,
) {
	if (filterRule.length > 0) {
		const args: NodeArray<Expression>[] = [];
		const toRel = <T extends FromArgWithSelf<any>>(
			a: T,
		): T extends FromArg<infer R> ? R : T => {
			console.log(a);
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
		let t = m;
		// TODO 理论上这里从哪call的也需要优化追踪,当然 这并不是什么非常需要的东西
		while (isCallExpression(t)) {
			args.push(t.arguments);
			t = t.expression;
		}
		const witchCall = scopeHelper.parseExpression(t);
		if (witchCall.type === ScopeVarType.Import) {
			const { filePath, varPath } = witchCall;
			const name = varPath.join(".") || "*";
			const item = filterRule.find(
				(r) =>
					(Array.isArray(r.import)
						? r.import.includes(filePath)
						: r.import === filePath) &&
					(Array.isArray(r.name) ? r.name.includes(name) : r.name === name),
			);
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
	}
}
