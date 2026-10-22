export enum VNodeType {
	Element = 1,
	Comment = 2,
	Text = 3,
	Other = 999,
}

export interface HTMLVElement {
	type: VNodeType.Element;
	tagName: string;
	attributes: Record<string, any>;
	children: HTMLVNode[];
}
export interface HTMLVComment {
	type: VNodeType.Comment;
	content: string;
}
export interface HTMLVText {
	type: VNodeType.Text;
	content: string;
}
export interface OtherVElement {
	type: VNodeType.Other;
	text: string;
}

export type HTMLVNode =
	| OtherVElement
	| HTMLVElement
	| HTMLVComment
	| HTMLVText
	| string;
