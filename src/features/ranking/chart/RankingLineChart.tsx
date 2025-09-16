"use client";

import { LineChart } from "@/components/charts/LineChart";
import { dateToDashFormat } from "@/lib/utils";
import { useState } from "react";
import Tabs from "@/components/navigation/Tabs.old";
import { adjustColor } from "@/lib/utils/color.utils";
import { LineChartFilter } from "./components/LineChartFilter";
import type { DynamicTrackData } from "./hooks/useLineChartFilter";

// 統一的配置類型
export type LineChartConfig = {
	dataKey: string;
	isReverse: boolean;
	hasToggle?: boolean;
	toggleOptions?: Array<{ label: string; value: string; dataKey: string; isReverse: boolean }>;
};

// 統一的資料類型
export type UnifiedRankingData = {
	id: string;
	name: string;
	color: string | null;
	album?: {
		name: string | null;
		color: string | null;
	} | null;
	rankings?: Array<{ date: Date; dateId: string; [key: string]: unknown }>;
};

// 選單選項類型
export type MenuOptionType = {
	id: string;
	name: string;
	color: string | null;
	parentId?: string | null;
};

export type ParentOptionType = {
	id: string;
	color: string | null;
	name: string;
};

type RankingLineChartProps = {
	title?: string;
	defaultData: UnifiedRankingData;
	menuOptions: MenuOptionType[];
	parentOptions?: ParentOptionType[];
	config: LineChartConfig;
	className?: string;
	onLoadComparisonData?: (trackIds: string[]) => Promise<DynamicTrackData[]>;
};

export default function RankingLineChart({
	title = "Ranking Trends",
	defaultData,
	menuOptions,
	parentOptions,
	config,
	onLoadComparisonData,
}: RankingLineChartProps) {
	const [currentDataKey, setCurrentDataKey] = useState(config.dataKey);
	const [currentIsReverse, setCurrentIsReverse] = useState(config.isReverse);
	const [comparisonData, setComparisonData] = useState<DynamicTrackData[]>([]);

	if (!defaultData.rankings) return null;

	const dates = defaultData.rankings.map((item) => dateToDashFormat(item.date));
	const dateIds = defaultData.rankings.map((item) => item.dateId) ?? [];

	// 建立比較資料集
	const selectedDataset = comparisonData.map((data) => {
		const stats: (number | null)[] = [];
		const rankingsMap = new Map(
			data.rankings?.map((ranking) => [ranking.dateId, ranking]) || []
		);

		for (const dateId of dateIds) {
			const findRankingData = rankingsMap.get(dateId);
			if (findRankingData && findRankingData[currentDataKey as keyof typeof findRankingData] !== undefined) {
				stats.push(Number(findRankingData[currentDataKey as keyof typeof findRankingData]));
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

	// 處理 Tab 切換
	const handleTabChange = (value: string) => {
		const option = config.toggleOptions?.find(opt => opt.value === value);
		if (option) {
			setCurrentDataKey(option.dataKey);
			setCurrentIsReverse(option.isReverse);
		}
	};

	const defaultColor = defaultData.album?.color || defaultData.color;

	return (
		<>
			<div className="flex justify-between gap-4 sm:flex-row sm:items-start">
				{config.hasToggle && config.toggleOptions ? (
					<Tabs
						options={config.toggleOptions.map(opt => ({
							label: opt.label,
							id: opt.value,
							onClick: () => handleTabChange(opt.value)
						}))}
						color={defaultColor ? adjustColor(defaultColor, 0.8) : null}
						activeId={config.toggleOptions.find(opt =>
							opt.dataKey === currentDataKey && opt.isReverse === currentIsReverse
						)?.value || config.toggleOptions[0].value}
					/>
				) : (
					<h3>{title}</h3>
				)}

				<LineChartFilter
					defaultTag={{
						...defaultData,
						color: defaultColor || null
					}}
					menuOptions={menuOptions}
					parentOptions={parentOptions}
					onLoadComparisonData={onLoadComparisonData}
					onComparisonDataChange={(newData) => setComparisonData(newData)}
				/>
			</div>

			<LineChart
				data={{
					date: dates,
					dataset: [
						{
							name: defaultData.name,
							color: defaultColor,
							datas:
								defaultData.rankings.map((item) =>
									item[currentDataKey] ? Number(item[currentDataKey]) : null
								) ?? [],
						},
						...selectedDataset,
					],
				}}
				isReverse={currentIsReverse}
			/>
		</>
	);
}