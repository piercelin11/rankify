import { getSession } from "@/../auth";
import { artistRangeParamsSchema } from "@/lib/schemas/artist";
import { calculateDateRangeFromSlug } from "@/lib/utils";
import getAlbumsStats from "@/services/album/getAlbumsStats";
import getTracksStats from "@/services/track/getTracksStats";
import { getArtistRankingSubmissions } from "@/db/ranking";
import TopTracksCard from "@/features/ranking/top-tracks/TopTracksCard";
import LinkedAlbumCharts from "@/features/ranking/chart/LinkedAlbumCharts";
import AlbumPointsCard from "@/features/ranking/chart/AlbumPointsCard";
import { getRawTrackStats } from "@/features/album-points-lab/getRawTrackStats";
import {
	getSandboxWeightedAlbumAverages,
	getSandboxUnweightedAlbumAverages,
} from "@/features/album-points-lab/getSandboxAlbumAverages";
import {
	getAlbumScoreHistory,
	getUnweightedAlbumScoreHistory,
} from "@/features/album-points-lab/getAlbumScoreHistory";
import SandboxAlbumPointsCard from "@/features/album-points-lab/components/SandboxAlbumPointsCard";

type PageProps = {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{
		view?: string;
		submissionId?: string;
		range?: string;
	}>;
};

export default async function MyStatsPage({ params, searchParams }: PageProps) {
	const { artistId } = await params;
	const query = await searchParams;

	const range = artistRangeParamsSchema.parse(query.range);

	const user = await getSession();

	if (!user) return;

	const userId = user.id;
	const dateRange = calculateDateRangeFromSlug(range);

	const submissions = await getArtistRankingSubmissions({ artistId, userId });
	const latestSubmissionId = submissions[0]?.id;
	//TODO:處理沒有資料的回傳畫面
	if (!latestSubmissionId) return null;

	const [trackStats, albumStats, rawTrackStats, weightedHistory, unweightedHistory] =
		await Promise.all([
			getTracksStats({ artistId, userId }),
			getAlbumsStats({ artistId, userId, dateRange }),
			getRawTrackStats(artistId, userId),
			getAlbumScoreHistory({ artistId, userId }),
			getUnweightedAlbumScoreHistory({ artistId, userId }),
		]);

	const topTracks = trackStats.slice(0, 5);

	const sandboxWeightedAverages = rawTrackStats
		? getSandboxWeightedAlbumAverages(rawTrackStats)
		: [];
	const sandboxUnweightedAverages = rawTrackStats
		? getSandboxUnweightedAlbumAverages(rawTrackStats)
		: [];

	return (
		<div className="space-y-10 p-content">
			<TopTracksCard
				tracks={topTracks}
				columnKey={["highestRank"]}
				title="Your Top Tracks"
			/>

			<LinkedAlbumCharts albumStats={albumStats} />

			<AlbumPointsCard albumStats={albumStats} />

			<SandboxAlbumPointsCard
				averages={sandboxWeightedAverages}
				history={weightedHistory}
				title="Album Points — Weighted (Experimental)"
			/>

			<SandboxAlbumPointsCard
				averages={sandboxUnweightedAverages}
				history={unweightedHistory}
				title="Album Points — Unweighted (Experimental)"
			/>
		</div>
	);
}
