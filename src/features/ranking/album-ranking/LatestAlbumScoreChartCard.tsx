"use client";

import InfoTooltip from "@/components/overlay/InfoTooltip";
import AlbumScoreBarChart from "./components/AlbumScoreBarChart";
import WeightToggle from "./components/WeightToggle";
import { useWeightedItems } from "./hooks/useWeightedItems";
import type { AlbumRankingItem } from "./types";

type Props = {
	weightedItems: AlbumRankingItem[];
	unweightedItems: AlbumRankingItem[];
	title?: string;
};

export default function LatestAlbumScoreChartCard({
	weightedItems,
	unweightedItems,
	title = "Album Scores",
}: Props) {
	const { weighted, setWeighted, items } = useWeightedItems(
		weightedItems,
		unweightedItems
	);
	if (items.length === 0) return null;

	return (
		<div>
			<div className="mb-4 flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<h2>{title}</h2>
					<InfoTooltip content="Album score from your most recent ranking submission." />
				</div>
				<WeightToggle
					id="chart-weight-toggle"
					checked={weighted}
					onCheckedChange={setWeighted}
				/>
			</div>
			<AlbumScoreBarChart items={items} />
		</div>
	);
}
