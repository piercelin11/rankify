"use client";

import { useState } from "react";
import type { AlbumChartStatsType } from "@/types/album";
import type { PercentileKey } from "./constants";
import AlbumPercentileCard from "./AlbumPercentileCard";
import AlbumRatioCard from "./AlbumRatioCard";
import LinkToggleButton from "./components/LinkToggleButton";

type Props = {
	albumStats: AlbumChartStatsType[];
};

export default function LinkedAlbumCharts({ albumStats }: Props) {
	const [linked, setLinked] = useState(false);

	const [percentileA, setPercentileA] = useState<PercentileKey>("top25");
	const [percentileB, setPercentileB] = useState<PercentileKey>("top25");
	const [expandedA, setExpandedA] = useState(false);
	const [expandedB, setExpandedB] = useState(false);
	const [hoveredAlbumIdA, setHoveredAlbumIdA] = useState<string | null>(null);
	const [hoveredAlbumIdB, setHoveredAlbumIdB] = useState<string | null>(null);

	function toggleLink() {
		if (!linked) {
			setPercentileB(percentileA);
			setExpandedB(expandedA);
		}
		setLinked((prev) => !prev);
	}

	function handlePercentileAChange(value: PercentileKey) {
		setPercentileA(value);
		if (linked) setPercentileB(value);
	}
	function handlePercentileBChange(value: PercentileKey) {
		setPercentileB(value);
		if (linked) setPercentileA(value);
	}

	function handleExpandedAChange(value: boolean) {
		setExpandedA(value);
		if (linked) setExpandedB(value);
	}
	function handleExpandedBChange(value: boolean) {
		setExpandedB(value);
		if (linked) setExpandedA(value);
	}

	function handleHoverA(id: string | null) {
		setHoveredAlbumIdA(id);
		if (linked) setHoveredAlbumIdB(id);
	}
	function handleHoverB(id: string | null) {
		setHoveredAlbumIdB(id);
		if (linked) setHoveredAlbumIdA(id);
	}

	return (
		<div className="relative">
			<div className="mb-2 flex justify-end lg:hidden">
				<LinkToggleButton linked={linked} onToggle={toggleLink} />
			</div>

			<div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
				<AlbumPercentileCard
					albumStats={albumStats}
					percentile={percentileA}
					onPercentileChange={handlePercentileAChange}
					expanded={expandedA}
					onExpandedChange={handleExpandedAChange}
					hoveredAlbumId={hoveredAlbumIdA}
					onHoveredAlbumIdChange={handleHoverA}
				/>
				<AlbumRatioCard
					albumStats={albumStats}
					percentile={percentileB}
					onPercentileChange={handlePercentileBChange}
					expanded={expandedB}
					onExpandedChange={handleExpandedBChange}
					hoveredAlbumId={hoveredAlbumIdB}
					onHoveredAlbumIdChange={handleHoverB}
				/>
			</div>

			<div className="absolute left-1/2 top-44 hidden -translate-x-1/2 lg:block">
				<LinkToggleButton linked={linked} onToggle={toggleLink} />
			</div>
		</div>
	);
}
