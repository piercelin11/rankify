import SimpleDropdown from "@/components/dropdown/SimpleDropdown";
import { TIME_RANGE_OPTIONS } from "@/config/timeRangeOptions";
import { calculateDateRangeFromSlug } from "@/lib/utils";
import { getUserSession } from "../../../../../../../auth";
import { Card } from "@/components/ui/card";
import DoubleBarChart from "@/components/charts/DoubleBarChart";
import { Button } from "@/components/ui/button";
import SegmentControl from "@/components/navigation/SegmentControl";
import { OVERVIEW_SEGMENT_OPTIONS } from "@/config/segmentOptions";
import Link from "next/link";
import RankingTable from "@/features/ranking/table/RankingTable";
import getTracksStats from "@/services/track/getTracksStats";
import getAlbumsStats from "@/services/album/getAlbumsStats";

type pageProps = {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ range: string }>;
};

export default async function page({ params, searchParams }: pageProps) {
	const { artistId } = await params;
	const resolvedSearchParams = await searchParams;
	const { range } = resolvedSearchParams;
	const { id: userId } = await getUserSession();
	const dateRange = calculateDateRangeFromSlug(range);

	const queryString = new URLSearchParams(resolvedSearchParams).toString();
	const allRankingHref = `/artist/${artistId}/overview/ranking${
		queryString ? `?${queryString}` : ""
	}`;

	const trackRankings = await getTracksStats({
		artistId,
		userId,
		dateRange,
		take: 5,
	});

	const albumRankings = await getAlbumsStats({
		artistId,
		userId,
		dateRange,
	});

	return (
		<div className="space-y-16">
			<div className="flex items-center justify-between">
				<SegmentControl
					variant="simple"
					options={OVERVIEW_SEGMENT_OPTIONS}
					defaultValue="my-overview"
				/>
				<SimpleDropdown
					className="w-80"
					size="lg"
					options={TIME_RANGE_OPTIONS}
					defaultValue={range}
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
					<Link href={allRankingHref} className="mx-auto">
						<Button variant="link">View all tracks ranking</Button>
					</Link>
				</div>
			</div>
			<div className="flex gap-4 [&>div]:flex-1 [&>div]:p-8">
				{[1, 2, 3, 4].map((item) => (
					<Card key={item}>
						<h3 className="text-base text-neutral-500">Album Rankings</h3>
					</Card>
				))}
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
