import "typescript";
export enum VNodeType {
	Element = 1,
	Comment = 2,
	Text = 3,
	Outher = 999,
}

export interface HTMLVElement {
	type: VNodeType.Element;
	tagName: string;
	attributes: Record<string, any>;
	children: HTMLVNode[];
}
export interface HTMLVComment {
	type: VNodeType.Comment;
	conetnt: string;
}
export interface HTMLVText {
	type: VNodeType.Text;
	conetnt: string;
}
export interface OtherVElement {
	type: VNodeType.Outher;
	text: string;
}

export type HTMLVNode =
	| OtherVElement
	| HTMLVElement
	| HTMLVComment
	| HTMLVText
	| string;
