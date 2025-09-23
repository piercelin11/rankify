import { calculateDateRangeFromSlug } from "@/lib/utils";
import { getUserSession } from "@/../auth";
import { Card } from "@/components/ui/card";
import DoubleBarChart from "@/components/charts/DoubleBarChart";
import SimpleSegmentControl from "@/components/navigation/SimpleSegmentControl";
import getTracksStats from "@/services/track/getTracksStats";
import getAlbumsStats from "@/services/album/getAlbumsStats";
import { VIEW_SEGMENT_OPTIONS } from "@/config/segmentOptions";
import ClientStatsRankingTable from "@/features/ranking/table/client/ClientStatsRankingTable";
import { getLoggedAlbumNames, getAlbumRankingSessions } from "@/db/album";
import AlbumRankingBoard from "@/components/ranking/AlbumRankingBoard";

type pageProps = {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ range: string; view: string }>;
};

export default async function OverviewPage({
	params,
	searchParams,
}: pageProps) {
	const { artistId } = await params;
	const resolvedSearchParams = await searchParams;
	const { range, view } = resolvedSearchParams;
	const { id: userId } = await getUserSession();
	const dateRange = calculateDateRangeFromSlug(range);

	const currentView = view || "list";

	const trackRankings = await getTracksStats({
		artistId,
		userId,
		dateRange,
	});

	const albumRankings = await getAlbumsStats({
		artistId,
		userId,
		dateRange,
	});

	const albums = await getLoggedAlbumNames(artistId, userId);
	const albumSessions = await getAlbumRankingSessions(userId, artistId);

	return (
		<div>
			<div className="p-content">
				<SimpleSegmentControl
					options={VIEW_SEGMENT_OPTIONS}
					defaultValue={currentView}
				/>
			</div>

			{currentView === "list" ? (
				<ClientStatsRankingTable
					trackRankings={trackRankings}
					albums={albums.map((album) => album.name)}
				/>
			) : (
				<div className="space-y-6 p-content">
					<div>
						<h2 className="mb-4 text-2xl font-bold">專輯儀表板</h2>
						<AlbumRankingBoard albums={albumSessions} artistId={artistId} />
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
			)}
		</div>
	);
}
