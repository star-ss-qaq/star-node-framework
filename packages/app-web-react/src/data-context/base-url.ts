import { useContext } from "react";
import { createSystemProvide } from "./context-helper.js";

const base = createSystemProvide("baseUrl", "/");
export const provideBaseUrl = base.provide;
export const useBaseUrl = () => useContext(base.reactContext);
export const baseUrlContext = base.reactContext;
