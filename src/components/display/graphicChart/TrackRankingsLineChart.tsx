import { LineChart } from "@/components/chart/LineChart";
import { TrackStatsType } from "@/lib/data/ranking/overview/getTracksStats";
import { dateToDashFormat } from "@/lib/utils/helper";
import React from "react";

type TrackRankingsLineChartProps = {
	defaultData: TrackStatsType;
	allTracksStats: TrackStatsType[];
};

export default function TrackRankingsLineChart({
	defaultData,
	allTracksStats,
}: TrackRankingsLineChartProps) {


	return (
		<div className="space-y-20">
            <div className="flex justify-between">
                <h3>Track Chart Run</h3>
                
            </div>
			<LineChart
				data={{
					date: defaultData.rankings.map((item) => dateToDashFormat(item.date)),
					dataset: [
						{
							trackName: defaultData.name,
							color: defaultData.album?.color,
							rankings: defaultData.rankings.map((item) => item.ranking),
						},
					],
				}}
			/>
		</div>
	);
}
