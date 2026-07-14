import { requireSession } from "@/../auth";
import { getTracksHistory } from "@/services/track/getTracksHistory";
import MyStatsToolbar from "@/components/artist/MyStatsToolbar";
import { getAlbumsHistory } from "@/services/album/getAlbumsHistory";
import SimpleDropdown from "@/components/dropdown/SimpleDropdown";
import { getArtistRankingSubmissions } from "@/db/ranking";
import { notFound } from "next/navigation";
import { dateToDashFormat } from "@/lib/utils";
import TopTracksCard from "@/features/ranking/top-tracks/TopTracksCard";
import LinkedAlbumCharts from "@/features/ranking/chart/LinkedAlbumCharts";
import {
	getAlbumScoreHistory,
	getUnweightedAlbumScoreHistory,
} from "@/features/album-points-lab/getAlbumScoreHistory";
import LatestAlbumScoreChartCard from "@/features/ranking/album-ranking/LatestAlbumScoreChartCard";
import { toLatestRankingItems } from "@/features/ranking/album-ranking/utils/toRankingItems";

type PageProps = {
	params: Promise<{ artistId: string; submissionId: string }>;
};

export default async function SnapshotPage({ params }: PageProps) {
	const { artistId, submissionId } = await params;
	const { id: userId } = await requireSession();

	const submissions = await getArtistRankingSubmissions({ artistId, userId });
	const currentSubmission = submissions.find((s) => s.id === submissionId);

	if (!currentSubmission) {
		notFound();
	}

	const [trackHistory, albumHistoryStats, weightedHistory, unweightedHistory] =
		await Promise.all([
			getTracksHistory({ artistId, userId, submissionId }),
			getAlbumsHistory({ artistId, userId, submissionId }),
			getAlbumScoreHistory({ artistId, userId, submissionId }),
			getUnweightedAlbumScoreHistory({ artistId, userId, submissionId }),
		]);

	const topTracks = trackHistory.slice(0, 5);

	const albumsForRankingItems = albumHistoryStats.map((album) => ({
		id: album.id,
		name: album.name,
		img: album.img,
		color: album.color,
		releaseDate: album.releaseDate,
	}));
	const weightedItems = toLatestRankingItems(weightedHistory, albumsForRankingItems);
	const unweightedItems = toLatestRankingItems(
		unweightedHistory,
		albumsForRankingItems
	);

	return (
		<div className="space-y-10 p-content">
			<div className="flex items-center justify-between gap-4">
				<MyStatsToolbar
					artistId={artistId}
					activeTab="history"
					latestSubmissionId={submissions[0].id}
				/>

				<div className="flex items-center gap-2">
					<p className="text-sm text-muted-foreground">View stats from:</p>
					<SimpleDropdown
						size="sm"
						className="w-fit min-w-36 border-transparent bg-secondary"
						value={currentSubmission.id}
						placeholder={dateToDashFormat(currentSubmission.date)}
						options={submissions.map((s) => ({
							value: s.id,
							label: dateToDashFormat(s.date),
							href: `/artist/${artistId}/${s.id}`,
						}))}
					/>
				</div>
			</div>

			<TopTracksCard
				tracks={topTracks}
				columnKey={["peak"]}
				title="Your Top Tracks"
				fullRankingHref={`/artist/${artistId}/${submissionId}/all-rankings`}
			/>

			<LinkedAlbumCharts albumStats={albumHistoryStats} />

			<LatestAlbumScoreChartCard
				weightedItems={weightedItems}
				unweightedItems={unweightedItems}
			/>
		</div>
	);
}
