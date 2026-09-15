import {
	Expression,
	isArrayLiteralExpression,
	isIdentifier,
	isLiteralTypeNode,
	isNumericLiteral,
	isObjectLiteralExpression,
	isPropertyAssignment,
	isStringLiteral,
	isTupleTypeNode,
	SyntaxKind,
	TypeNode,
} from "typescript";

export function parseExpressionToValue<T = any>(
	node: Expression,
	throwError = false,
): T {
	if (!node) return undefined as any;
	if (isStringLiteral(node)) return node.text as any;
	if (isNumericLiteral(node)) return Number(node.text) as any;
	if (node.kind === SyntaxKind.FalseKeyword) return false as any;
	if (node.kind === SyntaxKind.TrueKeyword) return true as any;
	if (isArrayLiteralExpression(node))
		return node.elements.map((node) => parseExpressionToValue(node)) as any;
	if (isIdentifier(node)) {
		return node.escapedText as T;
	}
	if (isObjectLiteralExpression(node)) {
		const ret: any = {};
		node.properties.forEach((i) => {
			if (
				isPropertyAssignment(i) &&
				(isIdentifier(i.name) || isStringLiteral(i.name))
			) {
				ret[i.name.text] = parseExpressionToValue(i.initializer);
			}
		});
		return ret;
	}
	if (throwError) {
		throw new Error(`can not parse expression with node kind ${node.kind}`);
	}
	return undefined as any;
}

export function parseLiteralTypeNodeToValue<T = any>(node: TypeNode): T {
	if (isLiteralTypeNode(node)) return parseExpressionToValue(node.literal);
	if (isTupleTypeNode(node))
		return node.elements.map(parseLiteralTypeNodeToValue) as any;
	throw new Error(`can not parse type with node kind ${node.kind}`);
}
