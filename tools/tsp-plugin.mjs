import { transformer } from "@deepkit/type-compiler";

export default (context) => {
	const p = transformer(context);
	return (node) => p.transformSourceFile(node);
};
