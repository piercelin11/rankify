import UnifiedRankingLineChart, {
	LineChartConfig,
	UnifiedRankingData,
	MenuOptionType,
	ParentOptionType
} from "../RankingLineChart";

type NewTrackRankingLineChartProps = {
	defaultTrackData: UnifiedRankingData;
	allTrackData: UnifiedRankingData[];
	menuOptions: MenuOptionType[];
	parentOptions: ParentOptionType[];
};

export default function NewTrackRankingLineChart({
	defaultTrackData,
	allTrackData,
	menuOptions,
	parentOptions
}: NewTrackRankingLineChartProps) {
	const config: LineChartConfig = {
		dataKey: "ranking",
		isReverse: true,
		hasToggle: false
	};

	return (
		<UnifiedRankingLineChart
			title="Track Ranking Trends"
			defaultData={defaultTrackData}
			allData={allTrackData}
			menuOptions={menuOptions}
			parentOptions={parentOptions}
			config={config}
		/>
	);
}