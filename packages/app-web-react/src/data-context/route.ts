import { useContext } from "react";
import { createSystemProvide } from "./context-helper.js";

const base = createSystemProvide("route", { allRoute: [] });
export const provideRoute = base.provide;
export const useRoute = () => useContext(base.reactContext);
export const routeContext = base.reactContext;
