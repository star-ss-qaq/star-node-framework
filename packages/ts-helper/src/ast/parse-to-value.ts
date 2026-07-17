import {
	Expression,
	isArrayLiteralExpression,
	isLiteralTypeNode,
	isNumericLiteral,
	isStringLiteral,
	isTupleTypeNode,
	SyntaxKind,
	TypeNode,
} from "typescript";

export function parseExpressionToValue<T = any>(node: Expression): T {
	if (!node) return undefined as any;
	if (isStringLiteral(node)) return node.text as any;
	if (isNumericLiteral(node)) return Number(node.text) as any;
	if (node.kind === SyntaxKind.FalseKeyword) return false as any;
	if (node.kind === SyntaxKind.TrueKeyword) return true as any;
	if (isArrayLiteralExpression(node))
		return node.elements.map(parseExpressionToValue) as any;
	throw new Error(`can not parse expression with node kind ${node.kind}`);
}

export function parseLiteralTypeNodeToValue<T = any>(node: TypeNode): T {
	if (isLiteralTypeNode(node)) return parseExpressionToValue(node.literal);
	if (isTupleTypeNode(node))
		return node.elements.map(parseLiteralTypeNodeToValue) as any;
	throw new Error(`can not parse type with node kind ${node.kind}`);
}
