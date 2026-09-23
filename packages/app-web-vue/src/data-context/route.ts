import { computed } from "vue";
import { createSystemProvide } from "./context-helper.js";

const base = createSystemProvide(
	"route",
	computed(() => ({ allRoute: [] })),
);
export const provideRoute = base.provide;
export const useRoute = base.use;
