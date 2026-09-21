import { Get } from "../route/index.js";
import { IRender } from "./render/render.js";

export function View(path: string, render: IRender) {
	return Get(path, { render });
}
