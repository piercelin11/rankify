import { getUserSession } from "@/../auth";
import { calculateDateRangeFromSlug } from "@/lib/utils";
import getTracksStats from "@/services/track/getTracksStats";
import { getLoggedAlbumNames } from "@/db/album";
import ClientAdvancedRankingTable from "@/features/ranking/table/client/ClientAdvancedRankingTable";


type pageProps = {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ range: string }>;
};

export default async function OverviewRankingPage({
	params,
	searchParams,
}: pageProps) {
	const { artistId } = await params;
	const { range } = await searchParams;
	const { id: userId } = await getUserSession();
	const dateRange = calculateDateRangeFromSlug(range);

	const trackRankings = await getTracksStats({
		artistId,
		userId,
		dateRange,
	});
	const albums = await getLoggedAlbumNames(artistId, userId);

	return (
		<ClientAdvancedRankingTable
			trackRankings={trackRankings}
			albums={albums.map((album) => album.name)}
		/>
	);
}
