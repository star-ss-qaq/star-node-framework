import {
	BindingName,
	Expression,
	isArrayBindingPattern,
	isBindingElement,
	isCallExpression,
	isExpression,
	isIdentifier,
	isObjectBindingPattern,
	isPropertyAccessExpression,
	SyntaxKind,
} from "typescript";
import { Scope, ScopeVar, ScopeVarType } from "./type.js";
import { parseExpressionToValue } from "../parse-to-value.js";

const defalutUnknow: ScopeVar = { type: ScopeVarType.Unknow };

function getPathFromScope(arr: string[], sv: ScopeVar): ScopeVar {
	if (sv.type === ScopeVarType.Import) {
		return {
			...sv,
			varPath: [...sv.varPath, ...arr],
		};
	}
	return { type: ScopeVarType.Unknow };
}

function parseLeft(
	name: BindingName,
	path: string[] | [null, ...string[]] = [],
	map: Record<string, string[] | [null, ...string[]]> = Object.create(null),
) {
	if (isIdentifier(name)) {
		const varName = parseExpressionToValue(name);
		map[varName] = path;
		return map;
	} else if (isObjectBindingPattern(name)) {
		name.elements.forEach((i) => {
			let propertyName: string | undefined = undefined;
			if (i.propertyName) {
				if (isExpression(i.propertyName) || isIdentifier(i.propertyName)) {
					propertyName = parseExpressionToValue(i.propertyName);
				} else {
					// 字符串模板？或者其他之类的？目前识别不了
					return parseLeft(i.name, [null], map);
				}
			}
			if (isIdentifier(i.name)) {
				const varName = parseExpressionToValue(i.name);
				map[varName] = [
					...path,
					typeof propertyName === undefined ? varName : propertyName,
				];
			} else if (i.dotDotDotToken) {
				return parseLeft(i.name, path, map);
			} else {
				return parseLeft(i.name, [...path, propertyName || ""], map);
			}
		});
		return map;
	} else if (isArrayBindingPattern(name)) {
		name.elements.forEach((i, index) => {
			if (isBindingElement(i)) {
				if (i.dotDotDotToken) {
					return parseLeft(i.name, [null], map);
				}
				return parseLeft(i.name, [...path, `${index}`], map);
			}
		});
	}
	return map;
}

function findFromScopeVar(path: string[], init?: ScopeVar): ScopeVar {
	if (!init) return defalutUnknow;
	if (path.length === 0) return init;
	switch (init.type) {
		case ScopeVarType.Array: {
			const [current, ...next] = path;
			return findFromScopeVar(next, init.value[current as any]);
		}
		case ScopeVarType.Record: {
			const [current, ...next] = path;
			return findFromScopeVar(next, init.value[current]);
		}
		case ScopeVarType.Import: {
			return {
				...init,
				varPath: [...init.varPath, ...path],
			};
		}
		default:
			return defalutUnknow;
	}
	return defalutUnknow;
}

export class ScopeHelper {
	scope: Scope;
	constructor(private _parent?: ScopeHelper) {
		this.scope = Object.create(_parent?.scope || null);
	}
	parseExpression(node: Expression | undefined): ScopeVar {
		if (!node) {
			return defalutUnknow;
		}
		if (isCallExpression(node)) {
			if (
				node.expression.kind === SyntaxKind.ImportKeyword &&
				node.arguments[0]
			) {
				return {
					type: ScopeVarType.Import,
					filePath: parseExpressionToValue(node.arguments[0]),
					varPath: [],
				};
			}
			return {
				type: ScopeVarType.FunctionReturn,
			};
		} else if (isIdentifier(node)) {
			const v = parseExpressionToValue(node);
			if (this.scope[v]) {
				return this.scope[v];
			}
		} else if (isPropertyAccessExpression(node)) {
			const arr = [parseExpressionToValue(node.name)];
			let { expression } = node;
			while (isPropertyAccessExpression(expression)) {
				arr.push(parseExpressionToValue(expression.name));
				expression = expression.expression;
			}
			if (isExpression(expression)) {
				const v = parseExpressionToValue(expression);
				if (this.scope[v]) {
					return getPathFromScope(arr.reverse(), this.scope[v]);
				}
			}
		}
		return defalutUnknow;
	}
	getWhereVarDefine(name: string) {
		let last: ScopeHelper = this;
		let current: ScopeHelper | undefined = this;
		do {
			if (Object.hasOwn(current.scope, name)) {
				return current;
			}
			last = current;
			current = current._parent;
		} while (current);
		return last;
	}
	applyVarBind(
		name: BindingName,
		initExpression: Expression | undefined,
		defineOnly = false,
	) {
		const init = this.parseExpression(initExpression);
		const t = parseLeft(name);
		Object.entries(t).forEach(([k, path]) => {
			let value =
				path[0] !== null
					? findFromScopeVar(path as string[], init)
					: defalutUnknow;
			const upScope = defineOnly ? this.getWhereVarDefine(k) : this;
			upScope.scope[k] = value;
		});
	}
}
