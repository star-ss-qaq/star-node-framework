import { createSystemProvide } from "./context-helper.js";

const base = createSystemProvide("baseUrl", "/");
export const provideBaseUrl = base.provide;
export const useBaseUrl = base.use;
