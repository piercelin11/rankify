/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComparisonData } from "../types";

type ChartDataset = {
	name: string;
	color: string | null;
	datas: (number | null)[];
};

export function transformComparisonDataToDataset(
	comparisonData: ComparisonData[],
	dateIds: string[],
	dataKey: string
): ChartDataset[] {
	return comparisonData.map((data) => {
		const stats: (number | null)[] = [];
		const rankingsMap = new Map(
			data.rankings?.map((ranking) => [ranking.dateId, ranking]) || []
		);

		for (const dateId of dateIds) {
			const rankingData = rankingsMap.get(dateId);

			// Type narrowing based on data type
			if (rankingData) {
				if (data.type === 'track' && dataKey in rankingData) {
					stats.push(Number((rankingData as any)[dataKey]));
				} else if (data.type === 'album' && dataKey in rankingData) {
					stats.push(Number((rankingData as any)[dataKey]));
				} else {
					stats.push(null);
				}
			} else {
				stats.push(null);
			}
		}

		return {
			name: data.name,
			color: data.color,
			datas: stats,
		};
	});
}

export function extractDateInfo(rankings: Array<{ date: Date; dateId: string }>) {
	return {
		dates: rankings.map((item) => item.date),
		dateIds: rankings.map((item) => item.dateId),
	};
}

export function transformTrackToDataset(
	track: { name: string; color: string | null; rankings?: Array<{ [key: string]: unknown }> },
	dataKey: string
): ChartDataset {
	return {
		name: track.name,
		color: track.color,
		datas: track.rankings?.map((item) =>
			item[dataKey] ? Number(item[dataKey]) : null
		) ?? [],
	};
}