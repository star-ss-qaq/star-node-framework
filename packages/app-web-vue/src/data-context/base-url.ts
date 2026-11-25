import { createSystemProvide } from "./context-helper.js";

const base = createSystemProvide("prefix", "/");
export const providePrefix = base.provide;
export const usePrefix = base.use;
