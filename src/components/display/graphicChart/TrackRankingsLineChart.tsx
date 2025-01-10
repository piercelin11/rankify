"use client";

import { LineChart } from "@/components/chart/LineChart";
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
	const selectedTracks = allTracksStats.filter((data) =>
		selectedTrack.includes(data.id)
	);
	const selectedTracksDataset = selectedTracks.map((track) => {
		const dateIds = defaultData.rankings.map((item) => item.dateId);
		const rankings: (number | null)[] = [];

		for (const dateId of dateIds) {
			const ranking = track.rankings.find(
				(ranking) => ranking.dateId === dateId
			)?.ranking;
			if (ranking) rankings.push(ranking);
			else rankings.push(null);
		}

		return {
			name: track.name,
			color: track.album?.color,
			datas: rankings,
		};
	});

	return (
		<LineChart
			data={{
				date: dates,
				dataset: [
					{
						name: defaultData.name,
						color: defaultData.album?.color,
						datas: defaultData.rankings.map((item) => item.ranking),
					},
					...selectedTracksDataset,
				],
			}}
		/>
	);
}
