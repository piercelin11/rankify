"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import DonutChart from "@/components/charts/DonutChart";
import type { AlbumStatsType } from "@/types/album";
import { PERCENTILE_OPTIONS, type PercentileKey } from "./constants";
import PercentileSelect from "./components/PercentileSelect";

type Props = {
	albumStats: AlbumStatsType[];
	title?: string;
};

export default function AlbumPercentileCard({
	albumStats,
	title = "Album Percentile Distribution",
}: Props) {
	const [percentile, setPercentile] = useState<PercentileKey>("top25");

	const field = PERCENTILE_OPTIONS.find(
		(opt) => opt.value === percentile
	)!.field;

	const ranked = albumStats
		.map((album) => ({
			id: album.id,
			name: album.name,
			color: album.color,
			count: album[field],
		}))
		.filter((album) => album.count > 0)
		.sort((a, b) => b.count - a.count);

	if (ranked.length === 0) return null;

	const top3 = ranked.slice(0, 3);

	return (
		<Card className="bg-card/80 p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2>{title}</h2>
				<PercentileSelect value={percentile} onChange={setPercentile} />
			</div>

			<div className="h-[240px] xl:h-[320px] 2xl:h-[380px]">
				<DonutChart
					labels={ranked.map((album) => album.name)}
					data={ranked.map((album) => album.count)}
					colors={ranked.map((album) => album.color)}
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
						<div className="shrink-0 text-right text-base">{album.count}</div>
					</div>
				))}
			</div>
		</Card>
	);
}
