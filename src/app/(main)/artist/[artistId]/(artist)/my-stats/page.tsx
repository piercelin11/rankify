import { getUserSession } from "@/../auth";
import { getAlbumRankingSessions, getLoggedAlbumNames } from "@/db/album";
import MyStatsToolbar from "@/components/artist/MyStatsToolbar";
import ClientHistoryRankingTable from "@/features/ranking/table/client/ClientHistoryRankingTable";
import ClientStatsRankingTable from "@/features/ranking/table/client/ClientStatsRankingTable";
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
	const latestSubmissionId = submissions[0].id;

	const activeTab = submissionId ? "history" : view;

	let content: React.ReactNode;

	if (view === "overview") {
		const [albumRankings, albumSubmissions] = await Promise.all([
			getAlbumsStats({ artistId, userId, dateRange }),
			getAlbumRankingSessions({ userId, artistId }),
		]);

		content = (
			<OverviewView
				mode="average"
				albumRankings={albumRankings}
				albumSubmissions={albumSubmissions}
				artistId={artistId}
			/>
		);
	} else if (submissionId) {
		const [trackRankings, albums] = await Promise.all([
			getTracksHistory({ artistId, userId, submissionId }),
			getLoggedAlbumNames({ artistId, userId, dateRange }),
		]);

		content = (
			<ClientHistoryRankingTable
				trackRankings={trackRankings}
				albums={albums.map((album) => album.name)}
			/>
		);
	} else {
		const [trackRankings, albums] = await Promise.all([
			getTracksStats({ artistId, userId, dateRange }),
			getLoggedAlbumNames({ artistId, userId, dateRange }),
		]);

		content = (
			<ClientStatsRankingTable
				trackRankings={trackRankings}
				albums={albums.map((album) => album.name)}
			/>
		);
	}

	return (
		<div className="space-y-10 p-content">
			<MyStatsToolbar
				artistId={artistId}
				activeTab={activeTab}
				latestSubmissionId={latestSubmissionId}
			/>
			{content}
		</div>
	);
}
