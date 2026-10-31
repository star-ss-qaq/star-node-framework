import { RenderContext } from "@thestarweb/star-framework-app-web";
import {
	createContext,
	createElement,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { RenderType } from "../type.js";
import { ReactRender } from "../render.js";

export const routeContext = createContext<{
	child: RenderContext;
	mode: RenderType;
} | null>(null);
export function SFRoute() {
	const isFirstRender = useRef(true);
	const refDiv = useRef<HTMLDivElement>(null);
	const context = useContext(routeContext);
	useEffect(() => {
		try {
			if (context?.child.render instanceof ReactRender) {
				return;
			}
			const ins = context?.child[
				isFirstRender.current && context.mode == "hydrate" ? "hydrate" : "mount"
			]?.(refDiv.current!, {});
			return () => ins?.unMount();
		} finally {
			isFirstRender.current = false;
		}
	}, [context]);
	if (context?.child.render instanceof ReactRender) {
		const subContext = useMemo(
			() =>
				context.child.child
					? {
							child: context.child.child,
							mode: context.mode,
						}
					: null,
			[],
		);
		return createElement(
			routeContext.Provider,
			{ value: subContext },
			createElement(context.child.render.comp, context.child.prop),
		);
	}
	if (context?.mode === "ssr") {
		let textInit = isFirstRender.current
			? context?.child.warpRenderToString({})
			: undefined;
		return createElement("div", {
			ref: refDiv,
			dangerouslySetInnerHTML:
				typeof textInit === "string" ? { __html: textInit } : undefined,
		});
	}
	return createElement("div", {
		ref: refDiv,
	});
}
