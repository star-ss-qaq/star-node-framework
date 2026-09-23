import {
	type RenderDataContext,
	SFDataContext,
} from "@thestarweb/star-framework-app-web";
import {
	App,
	computed,
	ComputedRef,
	inject,
	ShallowRef,
	shallowRef,
} from "vue";

export type GetSFDataContextType<T extends SFDataContext<any>> =
	T extends SFDataContext<infer R> ? R : unknown;

export function sfContextToRef<T extends SFDataContext<any>>(
	context: T,
): ComputedRef<GetSFDataContextType<T>> {
	const r = shallowRef(context.value);
	context.watch((newValue) => {
		r.value = newValue;
	});
	return computed(() => r.value);
}
type GetPType<P extends keyof RenderDataContext["system"]> =
	RenderDataContext["system"][P] extends SFDataContext<infer TT>
		? ComputedRef<TT>
		: RenderDataContext["system"][P];
export function createSystemProvide<
	P extends keyof RenderDataContext["system"],
>(path: P, defaultValue: GetPType<P>) {
	const provideKey = Symbol();
	return {
		provide(context: RenderDataContext, app: App) {
			const value = context.system[path];
			app.provide(
				provideKey,
				value instanceof SFDataContext ? sfContextToRef(value) : value,
			);
		},
		use() {
			return inject<GetPType<P>>(provideKey, defaultValue);
		},
	};
}
