import {
	MethodDeclaration,
	ModifierLike,
	NodeFactory,
	SyntaxKind,
} from "typescript";
import { MethodRemoveOption } from "../types.js";

export function removeMethod(
	option: MethodRemoveOption = "all",
	node: MethodDeclaration,
	factory: NodeFactory,
	newDecorator?: ModifierLike[],
) {
	if (option === "all") return [];
	return factory.updateMethodDeclaration(
		node,
		newDecorator || node.modifiers,
		node.asteriskToken,
		node.name,
		node.questionToken,
		node.typeParameters,
		option.prop
			? [
					factory.createParameterDeclaration(
						[],
						factory.createToken(SyntaxKind.DotDotDotToken),
						"prop",
						undefined,
						factory.createArrayTypeNode(
							factory.createToken(SyntaxKind.AnyKeyword),
						),
					),
				]
			: node.parameters,
		option.returnType ? undefined : node.type,
		option.body === "throw"
			? factory.createBlock([
					factory.createThrowStatement(
						factory.createNewExpression(
							factory.createIdentifier("Error"),
							undefined,
							[
								factory.createStringLiteral(
									"can not call this function in this side!",
								),
							],
						),
					),
				])
			: option.body || option.prop
				? factory.createBlock([])
				: node.body,
	);
}
