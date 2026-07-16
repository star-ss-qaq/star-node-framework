import {
	Expression,
	isArrayLiteralExpression,
	isNumericLiteral,
	isStringLiteral,
	SyntaxKind,
} from "typescript";

export function parseExpressionToValue<T = any>(node: Expression): T {
	if (isStringLiteral(node)) return node.text as any;
	if (isNumericLiteral(node)) return Number(node.text) as any;
	if (node.kind === SyntaxKind.FalseKeyword) return false as any;
	if (node.kind === SyntaxKind.TrueKeyword) return true as any;
	if (isArrayLiteralExpression(node))
		return node.elements.map(parseExpressionToValue) as any;
	throw new Error(`can not parse expression with node kind ${node.kind}`);
}
