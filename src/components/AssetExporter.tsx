import { Button, SplitLayout, Text, Tooltip } from "@salt-ds/core";
import { DownloadIcon } from "@salt-ds/icons";
import { StaticList, StaticListItem } from "@salt-ds/lab";
import React from "react";
import "./AssetExporter.css";
import JSZip from "jszip";
import { GetSelectionMessage } from "../messages";
import { ProcessedNode } from "../types";
import { useFigmaSubscribe } from "./useFigmaSubscribe";

const defaultSelectedNodes: ProcessedNode[] = [];

function downloadFile(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.style.display = "none";
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

async function handleExport(assets: ProcessedNode[], zip?: boolean) {
	if (assets.length == 1 && !zip) {
		const { svg, name } = assets[0];
		const svgData = new Blob([svg], { type: "image/svg+xml" });
		downloadFile(svgData, name);
	} else {
		const zip = new JSZip();
		assets.forEach((e) => {
			zip.file(`${e.name}.svg`, e.svg);
		});

		downloadFile(await zip.generateAsync({ type: "blob" }), "export.zip");
	}
}

function AssetListItem({ node }: { node: ProcessedNode }) {
	return (
		<StaticListItem className="assetListItem">
			<div
				className="assetPreview"
				dangerouslySetInnerHTML={{ __html: node.svg }}
			/>
			<Text>{node.name}</Text>
			<Tooltip content="Export SVG">
				<Button
					className="exportButton"
					aria-label={`Export`}
					appearance="transparent"
					onClick={() => handleExport([node])}
				>
					<DownloadIcon />
				</Button>
			</Tooltip>
		</StaticListItem>
	);
}

export function AssetExporter() {
	const selectedNodes = useFigmaSubscribe<ProcessedNode[]>(
		GetSelectionMessage.type,
		defaultSelectedNodes,
	);

	return (
		<div className="container">
			{selectedNodes?.length <= 0 && (
				<div className="empty-message">
					<Text color="secondary">Select some assets to export</Text>
				</div>
			)}
			{selectedNodes.length > 0 && (
				<>
					<StaticList className="assetList">
						{selectedNodes.map((node) => (
							<AssetListItem key={node.id} node={node} />
						))}
					</StaticList>
					<SplitLayout
						className="toolbar"
						startItem={
							<Text color="secondary" styleAs="notation">
								{selectedNodes.length} selected assets
							</Text>
						}
						endItem={
							<Button
								sentiment="accented"
								onClick={() => handleExport(selectedNodes, true)}
							>
								Export all
							</Button>
						}
					/>
				</>
			)}
		</div>
	);
}
