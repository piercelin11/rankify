import { getUserSession } from "@/../auth";
import { getAlbumRankingSessions, getLoggedAlbumNames } from "@/db/album";
import MyStatsToolbar from "@/components/artist/MyStatsToolbar";
import OverviewView from "@/features/ranking/views/OverviewView";
import { cuidSchema } from "@/lib/schemas/general";
import {
	artistRangeParamsSchema,
	artistViewParamsSchema,
} from "@/lib/schemas/artist";
import { calculateDateRangeFromSlug } from "@/lib/utils";
import getAlbumsStats from "@/services/album/getAlbumsStats";
import { getTracksHistory } from "@/services/track/getTracksHistory";
import getTracksStats from "@/services/track/getTracksStats";
import { getArtistRankingSubmissions } from "@/db/ranking";
import RankingTable from "@/features/ranking/table/RankingTable";

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

	const { id: userId } = await getUserSession();
	const dateRange = calculateDateRangeFromSlug(range);

	const submissions = await getArtistRankingSubmissions({ artistId, userId });
	const latestSubmissionId = submissions[0]?.id;
	//TODO:處理沒有資料的回傳畫面
	if (!latestSubmissionId) return null;

	let content: React.ReactNode;

	if (view === "overview") {
		const [trackStats, albumStats, albumSubmissions] = await Promise.all([
			getTracksStats({ artistId, userId }),
			getAlbumsStats({ artistId, userId, dateRange }),
			getAlbumRankingSessions({ userId, artistId }),
		]);

		content = (
			<OverviewView
				albumStats={albumStats}
				albumSubmissions={albumSubmissions}
				trackStats={trackStats}
			/>
		);
	} else if (submissionId) {
		const [trackRankings, albums] = await Promise.all([
			getTracksHistory({ artistId, userId, submissionId }),
			getLoggedAlbumNames({ artistId, userId, dateRange }),
		]);

		content = (
			<RankingTable
				data={trackRankings}
				submissions={submissions}
				currentSubmissionId={submissionId}
				columnKey={["peak", "achievement"]}
				availableAlbums={albums.map((album) => album.name)}
				view="snapshot"
			/>
		);
	} else {
		const [trackRankings, albums] = await Promise.all([
			getTracksStats({ artistId, userId }),
			getLoggedAlbumNames({ artistId, userId, dateRange }),
		]);

		content = (
			<RankingTable
				data={trackRankings}
				submissions={submissions}
				currentSubmissionId={submissionId}
				columnKey={["highestRank"]}
				availableAlbums={albums.map((album) => album.name)}
				view="average"
			/>
		);
	}

	return (
		<div className="space-y-10 p-content">
			<MyStatsToolbar
				artistId={artistId}
				activeTab={view}
				latestSubmissionId={latestSubmissionId}
			/>
			{content}
		</div>
	);
}
