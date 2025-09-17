import SimpleDropdown from "@/components/dropdown/SimpleDropdown";
import { TIME_RANGE_OPTIONS } from "@/config/timeRangeOptions";
import { calculateDateRangeFromSlug } from "@/lib/utils";
import { getUserSession } from "@/../auth";
import { Card } from "@/components/ui/card";
import DoubleBarChart from "@/components/charts/DoubleBarChart";
import { Button } from "@/components/ui/button";
import SimpleSegmentControl from "@/components/navigation/SimpleSegmentControl";
import { OVERVIEW_SEGMENT_OPTIONS } from "@/config/segmentOptions";
import Link from "next/link";
import getTracksStats from "@/services/track/getTracksStats";
import getAlbumsStats from "@/services/album/getAlbumsStats";
import ClientRankingTable from "@/features/ranking/table/client/ClientRankingTable";

type pageProps = {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ range: string }>;
};

export default async function OverviewPage({ params, searchParams }: pageProps) {
	const { artistId } = await params;
	const resolvedSearchParams = await searchParams;
	const { range } = resolvedSearchParams;
	const { id: userId } = await getUserSession();
	const dateRange = calculateDateRangeFromSlug(range);

	const queryString = new URLSearchParams(resolvedSearchParams).toString();
	const allRankingHref = `/artist/${artistId}/overview/ranking${queryString ? `?${queryString}` : ""}`;

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
				<SimpleSegmentControl
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
				<ClientRankingTable trackRankings={trackRankings} />
				<div className="flex">
					<Link href={allRankingHref} className="mx-auto">
						<Button variant="link">View all tracks ranking</Button>
					</Link>
				</div>
			</div>
			<div>
				<h2 className="mb-4">Album Rankings</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{albumRankings.map((album) => (
						<Card key={album.name} className="p-6">
							<h3 className="text-base text-neutral-500 mb-2">{album.name}</h3>
							<div className="space-y-1">
								<p className="text-2xl font-bold">{album.avgPoints.toFixed(1)}</p>
								<p className="text-sm text-neutral-400">
									Base: {album.avgBasePoints.toFixed(1)}
								</p>
							</div>
						</Card>
					))}
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
