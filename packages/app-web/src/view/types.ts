import { IRender } from "./render/render.js";

export interface ViewMeta {
	title: string;
	/**
	 * html的meta标签，通常用于seo，当前仅再ssr时生效，浏览器页面切换时不修改
	 */
	htmlMeta?: Record<string, string>;
}

export interface ViewInfo<T = any> {
	render: IRender;
	meta?: ViewMeta | ((data: T) => ViewMeta);
}

export interface RenderConfig {
	baseUrl: string;
}
