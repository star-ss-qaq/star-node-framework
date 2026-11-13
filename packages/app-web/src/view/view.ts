import { Get } from "../route/index.js";
import { IRender } from "./render/render.js";
import { DataHandle, ViewInfo } from "./types.js";

export function View(
	path: string,
	render: IRender,
	meta?: ViewInfo["meta"],
	dataHandle?: DataHandle ,
) {
	return Get(path, { view: { render, meta, dataHandle } });
}
