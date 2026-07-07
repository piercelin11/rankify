"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import RatioBarChart from "@/components/charts/RatioBarChart";
import type { AlbumStatsType } from "@/types/album";
import { PERCENTILE_OPTIONS, type PercentileKey } from "./constants";
import PercentileSelect from "./components/PercentileSelect";
type Props = {
	albumStats: AlbumStatsType[];
	title?: string;
};

export default function AlbumRatioCard({
	albumStats,
	title = "Album Percentile Ratio",
}: Props) {
	const [percentile, setPercentile] = useState<PercentileKey>("top25");

	const field = PERCENTILE_OPTIONS.find(
		(opt) => opt.value === percentile
	)!.field;

	const withRatio = albumStats
		.filter((album) => album.trackCount > 0)
		.map((album) => ({
			id: album.id,
			name: album.name,
			color: album.color,
			ratio: album[field] / album.trackCount,
		}));

	if (withRatio.length === 0) return null;

	const top3 = [...withRatio].sort((a, b) => b.ratio - a.ratio).slice(0, 3);

	return (
		<Card className="bg-card/80 p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2>{title}</h2>
				<PercentileSelect value={percentile} onChange={setPercentile} />
			</div>

			<div className="h-[240px] xl:h-[320px] 2xl:h-[380px]">
				<RatioBarChart
					items={withRatio.map((album) => ({
						id: album.id,
						value: album.ratio,
						color: album.color,
					}))}
				/>
			</div>

			<div className="mt-6 border-t border-border/50">
				{top3.map((album, index) => (
					<div
						key={album.id}
						className="flex items-center gap-3 px-4 py-2 first:pt-4"
					>
						<div className="w-6 shrink-0 text-left font-numeric text-muted-foreground">
							0{index + 1}
						</div>
						<p className="min-w-0 flex-1 truncate font-semibold">
							{album.name}
						</p>
						<div className="shrink-0 text-right text-base">
							{Math.round(album.ratio * 100)}%
						</div>
					</div>
				))}
			</div>
		</Card>
	);
}
