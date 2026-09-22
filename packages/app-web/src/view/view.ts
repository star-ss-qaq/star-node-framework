import { Get } from "../route/index.js";
import { IRender } from "./render/render.js";
import { ViewInfo } from "./types.js";

export function View(path: string, render: IRender, meta?: ViewInfo["meta"]) {
	return Get(path, { view: { render, meta } });
}
