import PillTabs from "../navigation/PillTabs";

type Props = {
	artistId: string;
	activeTab: "overview" | "history" | "all-rankings";
	latestSubmissionId: string;
};

export default async function MyStatsToolbar({
	artistId,
	activeTab,
	latestSubmissionId,
}: Props) {
	return (
		<PillTabs
			value={activeTab}
			options={[
				{
					label: "Overview",
					value: "overview",
					href: `/artist/${artistId}?view=overview`,
				},
				{
					label: "History",
					value: "history",
					href: `/artist/${artistId}/${latestSubmissionId}`,
				},
				{
					label: "All Rankings",
					value: "all-rankings",
					href: `/artist/${artistId}?view=all-rankings`,
				},
			]}
		/>
	);
}
