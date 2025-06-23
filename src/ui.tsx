import { SaltProviderNext } from "@salt-ds/core";
import React from "react";
import { createRoot } from "react-dom/client";
import { AssetExporter } from "./components/AssetExporter";
import { useFigmaPluginTheme } from "./components/useFigmaPluginTheme";

import "@salt-ds/theme/index.css";
import "@salt-ds/theme/css/theme-next.css";
import "./ui.css";

function App() {
	const [theme] = useFigmaPluginTheme();

	return (
		<SaltProviderNext mode={theme} accent="teal" corner="rounded">
			<AssetExporter />
		</SaltProviderNext>
	);
}

document.addEventListener("DOMContentLoaded", function () {
	const container = document.getElementById("root");
	if (!container) return;
	const root = createRoot(container);
	root.render(<App />);
});
