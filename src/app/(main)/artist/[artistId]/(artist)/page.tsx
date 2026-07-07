import { getSession } from "@/../auth";
import {
	getAlbumRankingSessions,
	getAlbumsByArtistId,
	getLoggedAlbumNames,
} from "@/db/album";
import MyStatsToolbar from "@/components/artist/MyStatsToolbar";
import OverviewView from "@/features/ranking/views/OverviewView";
import { cuidSchema } from "@/lib/schemas/general";
import {
	artistRangeParamsSchema,
	artistViewParamsSchema,
} from "@/lib/schemas/artist";
import { calculateDateRangeFromSlug, cn } from "@/lib/utils";
import getAlbumsStats from "@/services/album/getAlbumsStats";
import { getTracksHistory } from "@/services/track/getTracksHistory";
import getTracksStats from "@/services/track/getTracksStats";
import { getArtistRankingSubmissions } from "@/db/ranking";
import RankingTable from "@/features/ranking/table/RankingTable";
import TopTracksCard from "@/features/ranking/top-tracks/TopTracksCard";

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

	const view = artistViewParamsSchema.parse(query.view);
	const range = artistRangeParamsSchema.parse(query.range);
	const submissionId = cuidSchema.optional().parse(query.submissionId);

	const user = await getSession();

	if (!user) return;

	const userId = user.id;
	const dateRange = calculateDateRangeFromSlug(range);

	const submissions = await getArtistRankingSubmissions({ artistId, userId });
	const latestSubmissionId = submissions[0]?.id;
	//TODO:處理沒有資料的回傳畫面
	if (!latestSubmissionId) return null;

	const [trackStats, albumStats, albumSubmissions] = await Promise.all([
			getTracksStats({ artistId, userId }),
			getAlbumsStats({ artistId, userId, dateRange }),
			getAlbumRankingSessions({ userId, artistId }),
		]);

	const topTracks = trackStats.slice(0, 5);

	return (
		<div className="p-content space-y-10">
			<TopTracksCard
				tracks={topTracks}
				columnKey={["highestRank"]}
				title="Your Top Tracks"
			/>
		</div>
	);
}
