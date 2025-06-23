import { defineConfig } from "@rsbuild/core";

export default defineConfig(({ envMode }) => ({
	html: {
		title: "Asset Exporter",
		template: "./src/ui.html",
	},
	mode: envMode === "production" ? "production" : "development",
	devtool: envMode === "production" ? false : "inline-source-map",
	source: {
		entry: {
			ui: {
				import: "./src/ui.tsx",
			},
			code: {
				import: "./src/code.ts",
				html: false,
			},
		},
	},
	output: {
		cleanDistPath: true,
		inlineScripts: true,
		inlineStyles: true,

		legalComments: "inline",
		filename: {
			js: "[name].js",
		},
		distPath: {
			js: ".",
		},
	},
	performance: {
		chunkSplit: {
			strategy: "all-in-one",
		},
	},
	tools: {
		htmlPlugin: {
			filename: "ui.html",
			inlineSource: ".(js)$",
			chunks: ["ui"],
		},
	},
}));
