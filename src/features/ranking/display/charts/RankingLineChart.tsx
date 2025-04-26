"use client";

import { LineChart } from "@/components/charts/LineChart";
import { dateToDashFormat } from "@/lib/utils/helper";
import { AlbumData } from "@/types/data";
import { useSearchParams } from "next/navigation";
import React from "react";

type RankingLineChartProps<T> = {
	defaultData: {
		id: string;
		name: string;
		color?: string | null;
		album?: {
			name: string | null;
			color: string | null;
		} | null;
		rankings?: T[];
	};
	allRankings: {
		id: string;
		name: string;
		color?: string | null;
		album?: {
			name: string | null;
			color: string | null;
		} | null;
		rankings?: T[];
	}[];
	dataKey: keyof T;
	isReverse: boolean;
};

export default function RankingLineChart<
	T extends { date: Date; dateId: string },
>({ defaultData, allRankings, dataKey, isReverse }: RankingLineChartProps<T>) {
	if (!defaultData.rankings) return;

	const searchParams = useSearchParams();
	const selectedIds = searchParams.getAll("comparison");
	const selectedIdSet = new Set(selectedIds);

	const dates = defaultData.rankings.map((item) => dateToDashFormat(item.date));
	const dateIds = defaultData.rankings.map((item) => item.dateId) ?? [];

	const selectedContents = allRankings.filter((data) =>
		selectedIdSet.has(data.id)
	);

	const selectedDataset = selectedContents.map((data) => {
		const stats: (number | null)[] = [];
		const rankingsMap = new Map(
			data.rankings!.map((ranking) => [ranking.dateId, ranking])
		);

		for (const dateId of dateIds) {
			const findRankingData = rankingsMap.get(dateId);
			if (findRankingData) stats.push(Number(findRankingData[dataKey]));
			else stats.push(null);
		}

		return {
			name: data.name,
			color: data.album ? data.album.color : data.color,
			datas: stats,
		};
	});

	return (
		<LineChart
			data={{
				date: dates,
				dataset: [
					{
						name: defaultData.name,
						color: defaultData.album?.color || defaultData.color,
						datas:
							defaultData.rankings.map((item) =>
								item[dataKey] ? Number(item[dataKey]) : null
							) ?? [],
					},
					...selectedDataset,
				],
			}}
			isReverse={isReverse}
		/>
	);
}
