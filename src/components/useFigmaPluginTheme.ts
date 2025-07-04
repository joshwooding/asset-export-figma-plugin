import React, { useCallback, useEffect, useState } from "react";

export const useFigmaPluginTheme = (
	defaultTheme: "light" | "dark" = "light",
) => {
	const [theme, setTheme] = useState(defaultTheme);

	useEffect(() => {
		// Support Figma dark theme
		if (document.querySelector("html")?.classList.contains("figma-dark")) {
			setTheme("dark");
		} else {
			setTheme("light");
		}
	}, []);

	const onMutation = useCallback<MutationCallback>((mutationList) => {
		const theme = (mutationList[0].target as HTMLElement).classList.contains(
			"figma-dark",
		)
			? "dark"
			: "light";
		setTheme(theme);
	}, []);

	useMutationObservable(document.querySelector("html")!, onMutation);

	return [theme, setTheme] as const;
};

const DEFAULT_OPTIONS = {
	config: { attributes: true, childList: false, subtree: false },
};
function useMutationObservable(
	targetEl: Node,
	cb: MutationCallback,
	options = DEFAULT_OPTIONS,
) {
	const [observer, setObserver] = useState<MutationObserver | null>(null);

	useEffect(() => {
		const obs = new MutationObserver(cb);
		setObserver(obs);
	}, [cb, options, setObserver]);

	useEffect(() => {
		if (!observer) return;
		const { config } = options;
		observer.observe(targetEl, config);
		return () => {
			observer?.disconnect();
		};
	}, [observer, targetEl, options]);
}
