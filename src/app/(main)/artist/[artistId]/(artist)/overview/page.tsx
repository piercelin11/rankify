import SimpleDropdown from "@/components/dropdown/SimpleDropdown";
import { MY_OVERVIEW_DROPDOWN_OPTIONS } from "@/config/navData";
import { RankingTable } from "@/features/ranking/table";
import getTracksStats, {
	TimeFilterType,
} from "@/lib/database/ranking/overview/getTracksStats";
import { calculateDateRangeFromSlug } from "@/lib/utils";
import { getUserSession } from "../../../../../../../auth";
import { Card } from "@/components/ui/card";
import DoubleBarChart from "@/components/charts/DoubleBarChart";
import { getAlbumsStats } from "@/lib/database/ranking/overview/getAlbumsStats";
import { Button } from "@/components/ui/button";
import SegmentControl, {
	SegmentOption,
} from "@/components/navigation/SegmentControl";

type pageProps = {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ range: string }>;
};

export default async function page({ params, searchParams }: pageProps) {
	const { artistId } = await params;
	const { range } = await searchParams;
	const { id: userId } = await getUserSession();
	const startDate = calculateDateRangeFromSlug(range);

	const SegmentControlOptions: SegmentOption[] = [
		{
			label: "My Overview",
			value: "my-overview",
			queryParam: ["scope", "global"],
		},
		{
			label: "Global Overview",
			value: "global-overview",
			queryParam: ["scope", "personal"],
		},
	];

	const time: TimeFilterType | undefined = startDate
		? {
				threshold: startDate,
				filter: "gte",
			}
		: undefined;

	const trackRankings = await getTracksStats({
		artistId,
		userId,
		time,
        take: 5,
		options: {
			includeRankChange: false,
			includeAllRankings: false,
			includeAchievement: false,
		},
	});
    console.log(trackRankings)

	const albumRankings = await getAlbumsStats({
		artistId,
		userId,
		time,
	});

	return (
		<div className="space-y-16">
			<div className="flex items-center justify-between">
				<SegmentControl
					variant="simple"
					options={SegmentControlOptions}
					defaultValue="my-overview"
				/>
				<SimpleDropdown
					className="w-80"
					size="lg"
					options={MY_OVERVIEW_DROPDOWN_OPTIONS}
				/>
			</div>
			<div>
				<h2 className="mb-4">Track Rankings</h2>
				<RankingTable
					className="mb-4 border-b border-neutral-800"
					features={{
						header: false,
					}}
					data={trackRankings}
				/>
				<div className="flex">
					<Button variant="link" className="mx-auto">
						View all tracks ranking
					</Button>
				</div>
			</div>
			<div>
				<Card className="p-12">
					<h2 className="mb-4">Your Recent Rankings</h2>
					<DoubleBarChart
						data={{
							labels: albumRankings.map((album) => album.name),
							mainData: albumRankings.map((album) => album.avgPoints),
							subData: albumRankings.map((album) => album.avgBasePoints),
							color: albumRankings.map((album) => album.color),
						}}
					/>
				</Card>
			</div>
		</div>
	);
}
