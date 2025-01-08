"use client"

import { LineChart } from "@/components/chart/LineChart";
import LineChartFilterDropdown from "@/components/menu/LineChartFilterDropdown";
import { TrackStatsType } from "@/lib/database/ranking/overview/getTracksStats";
import { dateToDashFormat } from "@/lib/utils/helper";
import { useSearchParams } from "next/navigation";
import React from "react";

type TrackRankingsLineChartProps = {
	defaultData: TrackStatsType;
	allTracksStats: TrackStatsType[];
};

export default function TrackRankingsLineChart({
	defaultData,
	allTracksStats,
}: TrackRankingsLineChartProps) {
	const searchParams = useSearchParams();
	const selectedTrack = searchParams.getAll("comparison");

	const dates = defaultData.rankings.map((item) => dateToDashFormat(item.date));
	const selectedTracks = allTracksStats.filter(data => selectedTrack.includes(data.id));
	const selectedTracksDataset = selectedTracks.map(track => {
		const dateIds = defaultData.rankings.map((item) => item.dateId);
		const rankings: (number | null)[] = [];
		
		for (const dateId of dateIds) {
			const ranking = track.rankings.find(ranking => ranking.dateId === dateId)?.ranking;
			if (ranking) rankings.push(ranking);
			else rankings.push(null);
		}

		return {
			trackName: track.name,
			color: track.album?.color,
			rankings
		}
	})

	return (
		<div className="space-y-20 p-6">
            <div className="flex justify-between items-center">
                <h3>Track Chart Run</h3>
                <LineChartFilterDropdown defaultData={defaultData} allTracksStats={allTracksStats} />
            </div>
			<LineChart
				data={{
					date: dates,
					dataset: [
						{
							trackName: defaultData.name,
							color: defaultData.album?.color,
							rankings: defaultData.rankings.map((item) => item.ranking),
						},
						...selectedTracksDataset
					],
				}}
			/>
		</div>
	);
}
