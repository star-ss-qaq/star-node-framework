import { createSystemProvide } from "./context-helper.js";
import { SFWebRequest } from "@thestarweb/star-framework-app-web";

const base = createSystemProvide("request", null as any as SFWebRequest);
export const provideRequest = base.provide;
export const useRequest = base.use;
