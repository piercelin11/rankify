import LineChartFilter, { MenuOptionType, ParentOptionType } from "@/features/ranking/display/components/LineChartFilter";
import React from "react";
import RankingLineChart from "./RankingLineChart";
import { TrackStatsType } from "@/lib/database/ranking/overview/getTracksStats";

type TrackRankingLineChartProps = {
	defaultTrackData: TrackStatsType;
	allTrackData: TrackStatsType[];
	menuOptions: MenuOptionType[];
	parentOptions: ParentOptionType[];
};

export default function TrackRankingLineChart({defaultTrackData, allTrackData, menuOptions, parentOptions}: TrackRankingLineChartProps) {
	const trackColor = defaultTrackData.album.color || defaultTrackData.color;

	return (
		<div className="stats-card bg-glow space-y-8">
			<div className="flex flex-col justify-between sm:flex-row sm:items-center">
				<h3>Track Ranking Trends</h3>
				<LineChartFilter
					defaultTag={{ ...defaultTrackData, color: trackColor || null }}
					menuOptions={menuOptions}
					parentOptions={parentOptions}
				/>
			</div>
			<RankingLineChart
				defaultData={defaultTrackData}
				allRankings={allTrackData}
				dataKey={"ranking"}
				isReverse={true}
			/>
		</div>
	);
}
