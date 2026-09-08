import { Node, NodeFactory } from "typescript";

export type Visrior = <T extends Node>(
	node: T,
	factory: NodeFactory,
	scorp: any,
) => T | Node[];
