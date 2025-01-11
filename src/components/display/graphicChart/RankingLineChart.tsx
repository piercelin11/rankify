"use client";

import { LineChart } from "@/components/chartjs/LineChart";
import { dateToDashFormat } from "@/lib/utils/helper";
import { AlbumData } from "@/types/data";
import { useSearchParams } from "next/navigation";
import React from "react";

type RankingLineChartProps<T> = {
	defaultData: {
		id: string;
		name: string;
		color?: string | null;
		album?: AlbumData | null;
		rankings: T[];
	};
	allStats: {
		id: string;
		name: string;
		color?: string | null;
		album?: AlbumData | null;
		rankings: T[];
	}[];
	dataKey: keyof T;
	isReverse: boolean;
};
 
export default function RankingLineChart<
	T extends { date: Date; dateId: string },
>({ defaultData, allStats, dataKey, isReverse }: RankingLineChartProps<T>) {
	const searchParams = useSearchParams();
	const selectedIds = searchParams.getAll("comparison");

	const dates = defaultData.rankings.map((item) => dateToDashFormat(item.date));
	const selectedDatas = allStats.filter((data) =>
		selectedIds.includes(data.id)
	);
	const selectedDataset = selectedDatas.map((data) => {
		const dateIds = defaultData.rankings.map((item) => item.dateId);
		const stats: (number | null)[] = [];

		for (const dateId of dateIds) {
			const findData = data.rankings.find(
				(ranking) => ranking.dateId === dateId
			);
			if (findData) stats.push(Number(findData[dataKey]));
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
						color: defaultData.album ? defaultData.album.color : defaultData.color,
						datas: defaultData.rankings.map((item) =>
							item[dataKey] ? Number(item[dataKey]) : null
						),
					},
					...selectedDataset,
				],
			}}
			isReverse={isReverse}
		/>
	);
}
