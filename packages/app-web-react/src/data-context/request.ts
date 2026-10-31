import { useContext } from "react";
import { createSystemProvide } from "./context-helper.js";
import { SFWebRequest } from "@thestarweb/star-framework-app-web";

const base = createSystemProvide("request", new SFWebRequest("/"));
export const provideRequest = base.provide;
export const useRequest = () => useContext(base.reactContext);
export const requestContext = base.reactContext;
