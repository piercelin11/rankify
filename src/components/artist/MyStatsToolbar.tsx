import PillTabs from "../navigation/PillTabs";

type Props = {
	artistId: string;
	activeTab: "overview" | "history";
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
					href: `/artist/${artistId}`,
				},
				{
					label: "History",
					value: "history",
					href: `/artist/${artistId}/${latestSubmissionId}`,
				},
			]}
		/>
	);
}
