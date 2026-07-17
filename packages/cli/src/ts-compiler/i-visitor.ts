import { Node, NodeFactory } from "typescript";

export type Visrior = (
	node: Node,
	factory: NodeFactory,
	scorp: any,
) => Node | Node[];
