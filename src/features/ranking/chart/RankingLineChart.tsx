"use client";

import { LineChart } from "@/components/charts/LineChart";
import { dateToDashFormat } from "@/lib/utils";
import { useState } from "react";
import SimpleSegmentControl from "@/components/navigation/SimpleSegmentControl";
import LineChartFilter from "./components/LineChartFilter";
import { transformComparisonDataToDataset, extractDateInfo, transformTrackToDataset } from "./utils/dataTransform";
import type {
	ComparisonData,
	LineChartConfig,
	UnifiedRankingData,
	MenuOptionType,
	ParentOptionType,
} from "./types";

type RankingLineChartProps = {
	title?: string;
	defaultData: UnifiedRankingData;
	menuOptions: MenuOptionType[];
	parentOptions?: ParentOptionType[];
	config: LineChartConfig;
	className?: string;
	onLoadComparisonData?: (ids: string[]) => Promise<ComparisonData[]>;
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
	const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);

	if (!defaultData.rankings) return null;

	const { dates: rawDates, dateIds } = extractDateInfo(defaultData.rankings);
	const dates = rawDates.map((date) => dateToDashFormat(date));

	// 建立比較資料集
	const selectedDataset = transformComparisonDataToDataset(
		comparisonData,
		dateIds,
		currentDataKey
	);

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
					<SimpleSegmentControl
						options={config.toggleOptions.map(opt => ({
							label: opt.label,
							value: opt.value,
							onClick: () => handleTabChange(opt.value)
						}))}
						value={config.toggleOptions.find(opt =>
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
					onComparisonDataChange={setComparisonData}
				/>
			</div>

			<LineChart
				data={{
					date: dates,
					dataset: [
						transformTrackToDataset(
							{
								name: defaultData.name,
								color: defaultColor,
								rankings: defaultData.rankings,
							},
							currentDataKey
						),
						...selectedDataset,
					],
				}}
				isReverse={currentIsReverse}
			/>
		</>
	);
}