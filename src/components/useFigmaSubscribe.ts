import { useEffect, useState } from "react";
import { Messages } from "../messages";

export function useFigmaSubscribe<Data>(
	event: Messages["type"],
	data: Data,
	callback?: (t: MessageEvent) => void,
) {
	const [result, setResult] = useState(data);

	useEffect(() => {
		parent.postMessage({ pluginMessage: { type: event, data: data } }, "*");
	}, [data, event]);

	useEffect(() => {
		const handleMessage = (t: MessageEvent) => {

			if (!t.data.pluginMessage) return;
			const { data: n, type: a } = t.data.pluginMessage;

			if (a === event) {
				setResult(n);
				callback?.(t);
			}
		};

		window.addEventListener("message", handleMessage);

		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, [event, callback]);

	return result;
}
