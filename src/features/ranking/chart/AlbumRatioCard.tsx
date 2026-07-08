"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import RatioBarChart from "@/components/charts/RatioBarChart";
import InfoTooltip from "@/components/overlay/InfoTooltip";
import type { AlbumStatsType } from "@/types/album";
import { PERCENTILE_OPTIONS, type PercentileKey } from "./constants";
import PercentileSelect from "./components/PercentileSelect";
import ListDivider from "./components/ListDivider";
import { getCompetitionRanks } from "./utils/ranking";

type Props = {
	albumStats: AlbumStatsType[];
	title?: string;
	percentile: PercentileKey;
	onPercentileChange: (value: PercentileKey) => void;
	expanded: boolean;
	onExpandedChange: (value: boolean) => void;
	hoveredAlbumId: string | null;
	onHoveredAlbumIdChange: (id: string | null) => void;
};

export default function AlbumRatioCard({
	albumStats,
	title = "Album Percentile Ratio",
	percentile,
	onPercentileChange,
	expanded,
	onExpandedChange,
	hoveredAlbumId,
	onHoveredAlbumIdChange,
}: Props) {
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

	const ranked = [...withRatio].sort((a, b) => b.ratio - a.ratio);
	const ranks = getCompetitionRanks(ranked, (album) => album.ratio);
	const visibleAlbums = expanded ? ranked : ranked.slice(0, 3);

	return (
		<Card className="space-y-3 bg-card/80 p-6">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h2>{title}</h2>
					<InfoTooltip content="Percentage of each album's tracks that rank within the selected percentile." />
				</div>
				<PercentileSelect value={percentile} onChange={onPercentileChange} />
			</div>

			<div className="h-[240px] xl:h-[320px] 2xl:h-[380px]">
				<RatioBarChart
					items={withRatio.map((album) => ({
						id: album.id,
						label: album.name,
						value: album.ratio,
						color: album.color,
					}))}
					hoveredId={hoveredAlbumId}
					onHoveredIdChange={onHoveredAlbumIdChange}
				/>
			</div>

			<ListDivider
				showToggle={ranked.length > 3}
				expanded={expanded}
				onToggle={() => onExpandedChange(!expanded)}
			/>

			<div>
				{visibleAlbums.map((album, index) => {
					const isDimmed = hoveredAlbumId !== null;
					const isActive = hoveredAlbumId === album.id;

					return (
						<div
							key={album.id}
							className={cn("flex items-center gap-3 rounded-lg px-4 pb-3", {
								"text-muted-foreground/60": isDimmed,
								"text-foreground": isActive,
							})}
						>
							<div
								className={cn(
									"w-6 shrink-0 text-left font-numeric text-muted-foreground",
									{
										"text-muted-foreground/60": isDimmed,
										"text-foreground": isActive,
									}
								)}
							>
								{ranks[index] < 10 ? `0${ranks[index]}` : ranks[index]}
							</div>
							<p className="min-w-0 flex-1 truncate text-base font-semibold">
								{album.name}
							</p>
							<div className="shrink-0 text-right text-base">
								{Math.round(album.ratio * 100)}%
							</div>
						</div>
					);
				})}
			</div>
		</Card>
	);
}
