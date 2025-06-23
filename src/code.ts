import { GetSelectionMessage, Messages } from "./messages";
import { ProcessedNode } from "./types";

function getActiveNodes() {
	const selection = figma.currentPage.selection;
	if (!selection.length) return [];
	return selection.filter(
		(node) => node.type === "COMPONENT" || node.type === "COMPONENT_SET",
	);
}

function removeDeprecatedNotice(string: string) {
	if (string.includes("❌")) {
		return string.split("❌")[0].trim();
	}

	return string;
}

function getName(node: SceneNode) {
	const { name, type, parent } = node;

	const partsArray: string[] = [];

	if (type === "COMPONENT" && parent) {
		partsArray.push(removeDeprecatedNotice(parent.name));
	}

	const namePart =
		name.includes("=") && name.length > 1 ? name.match(/=([^,]*)/)?.[1] : name;

	if (namePart && namePart.toLowerCase() !== "default") {
		partsArray.push(removeDeprecatedNotice(namePart).toLowerCase());
	}

	return partsArray.join("_").replace(" ", "_");
}

async function processNode(node: SceneNode) {
	const svgExport = await node.exportAsync({ format: "SVG_STRING" });

	return {
		id: node.id,
		name: getName(node),
		svg: svgExport.replace(/ fill="(white|black|none)"/g, ""),
	};
}

async function processNodes(nodes: (ComponentSetNode | ComponentNode)[]) {
	const svgPromises: Promise<ProcessedNode>[] = [];

	nodes.forEach((node) => {
		if (node.type === "COMPONENT_SET") {
			node.children.forEach((child) => {
				svgPromises.push(processNode(child));
			});
		} else {
			svgPromises.push(processNode(node));
		}
	});

	const results = await Promise.allSettled(svgPromises);

	const processedNodes: ProcessedNode[] = [];

	results.forEach((result) => {
		if (result.status === "fulfilled") {
			processedNodes.push(result.value);
		} else {
			console.log("Failed to export node");
		}
	});

	figma.ui.postMessage({
		type: GetSelectionMessage.type,
		data: processedNodes,
	});
}

async function updateSelection() {
	await processNodes(getActiveNodes());
}

const debounce = (callback: (args: never) => void, wait: number) => {
	let timeoutId: undefined | number = undefined;
	return (...args: never) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			// eslint-disable-next-line prefer-spread
			callback.apply(null, args);
		}, wait);
	};
};

function subscribeToSelectionChanges() {
	figma.on("selectionchange", debounce(updateSelection, 500));
}

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
	themeColors: true,
});
figma.skipInvisibleInstanceChildren = true;

figma.ui.on("message", async (msg: Messages) => {
	if (msg.type === GetSelectionMessage.type) {
		await updateSelection();
		subscribeToSelectionChanges();
	} else if (msg.type === "closePlugin") {
		figma.closePlugin();
	}
});
