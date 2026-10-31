import {
	type RenderDataContext,
	SFDataContext,
} from "@thestarweb/star-framework-app-web";
import {
	createContext,
	createElement,
	ReactNode,
	useEffect,
	useState,
} from "react";

export type GetSFDataContextType<T extends SFDataContext<any>> =
	T extends SFDataContext<infer R> ? R : unknown;

export function sfContextToReactContext<T extends SFDataContext<any>>(
	context: T,
) {
	const reactContext = createContext(context.value);

	return {
		reactContext,
		Provide: ({ children }: { children: ReactNode | ReactNode[] }) => {
			const [value, setValue] = useState(context.value);
			useEffect(() => {
				return context.watch(setValue);
			}, []);
			return createElement(reactContext.Provider, { value }, children);
		},
	};
}
// type GetPType<P extends keyof RenderDataContext["system"]> =
// 	RenderDataContext["system"][P] extends SFDataContext<infer TT>
// 		? ComputedRef<TT>
// 		: RenderDataContext["system"][P];
// export function createSystemProvide<
// 	P extends keyof RenderDataContext["system"],
// >(path: P, defaultValue: GetPType<P>) {
// 	const provideKey = Symbol();
// 	return {
// 		provide(context: RenderDataContext, app: App) {
// 			const value = context.system[path];
// 			app.provide(
// 				provideKey,
// 				value instanceof SFDataContext ? sfContextToRef(value) : value,
// 			);
// 		},
// 		use() {
// 			return inject<GetPType<P>>(provideKey, defaultValue);
// 		},
// 	};
// }
type GetPType<P extends keyof RenderDataContext["system"]> =
	RenderDataContext["system"][P] extends SFDataContext<infer TT>
		? TT
		: RenderDataContext["system"][P];
export function createSystemProvide<
	P extends keyof RenderDataContext["system"],
>(path: P, defaultValue: GetPType<P>) {
	const reactContext = createContext(defaultValue);

	return {
		reactContext,
		provide: (context: RenderDataContext, children: ReactNode) => {
			const sfContext = context.system[path];
			if (sfContext instanceof SFDataContext) {
				const [value, setValue] = useState<any>(sfContext.value);
				useEffect(() => {
					return sfContext.watch(setValue);
				}, []);
				return createElement(reactContext.Provider, { value }, children);
			}
			return createElement(
				reactContext.Provider,
				{ value: sfContext as any },
				children,
			);
		},
	};
}
