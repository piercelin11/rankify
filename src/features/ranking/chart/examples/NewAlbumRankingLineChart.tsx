import UnifiedRankingLineChart, {
	LineChartConfig,
	UnifiedRankingData,
	MenuOptionType
} from "../RankingLineChart";

type NewAlbumRankingLineChartProps = {
	defaultAlbumData: UnifiedRankingData;
	allAlbumData: UnifiedRankingData[];
	menuOptions: MenuOptionType[];
};

export default function NewAlbumRankingLineChart({
	defaultAlbumData,
	allAlbumData,
	menuOptions
}: NewAlbumRankingLineChartProps) {
	const config: LineChartConfig = {
		dataKey: "points",
		isReverse: false,
		hasToggle: true,
		toggleOptions: [
			{
				label: "Album Points",
				value: "points",
				dataKey: "points",
				isReverse: false
			},
			{
				label: "Album Rankings",
				value: "rankings",
				dataKey: "ranking",
				isReverse: true
			}
		]
	};

	return (
		<UnifiedRankingLineChart
			title="Album Trends"
			defaultData={defaultAlbumData}
			allData={allAlbumData}
			menuOptions={menuOptions}
			config={config}
		/>
	);
}