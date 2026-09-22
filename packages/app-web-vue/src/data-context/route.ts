import { inject, ShallowRef } from "vue";
import { GetSFDataContextType } from "./context-helper.js";
import { RenderDataContext } from "@thestarweb/star-framework-app-web";

export const routeKey = Symbol();

export function useRoute() {
	return inject<
		ShallowRef<GetSFDataContextType<RenderDataContext["system"]["route"]>>
	>(routeKey);
}
