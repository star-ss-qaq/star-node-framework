import { Node, NodeFactory } from "typescript";
import type { ScopeHelper } from "./scope.js";

export enum ScopeVarType {
	Const = 1, // 暂不使用
	Import = 2,
	ImportingPromis = 3, // 暂不使用
	Record = 4, // 暂不使用
	Array = 5, // 暂不使用
	FunctionReturn = 6,
	NewObject = 7, // 暂不使用
	Customize = 8,
	Unknow = -1,
}
export type ScopeVar =
	| {
			type: ScopeVarType.Const;
			value: any;
	  }
	| {
			type: ScopeVarType.Import;
			filePath: string;
			varPath: string[];
	  }
	| {
			type: ScopeVarType.Import;
			filePath: string;
			varPath: string[];
	  }
	| {
			type: ScopeVarType.ImportingPromis;
			path: string;
	  }
	| {
			type: ScopeVarType.Record;
			value: Record<string, ScopeVar>;
	  }
	| {
			type: ScopeVarType.Array;
			value: ScopeVar[];
	  }
	| { type: ScopeVarType.FunctionReturn }
	| { type: ScopeVarType.NewObject }
	| {
			type: ScopeVarType.Customize;
			meta: any;
	  }
	| { type: ScopeVarType.Unknow };
export type Scope = Record<string, ScopeVar>;

export interface TSVisriorConfig {
	enableScop?: boolean;
	globalScop?: Scope;
}
export type TSVisrior = (<T extends Node>(
	node: T,
	factory: NodeFactory,
	scope: ScopeHelper,
) => T | Node[]) &
	TSVisriorConfig;
