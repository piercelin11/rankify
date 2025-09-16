type pageProps = {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ range: string }>;
};

import { getUserSession } from "../../../../../../../../auth";
import { calculateDateRangeFromSlug } from "@/lib/utils";
import getTracksStats from "@/services/track/getTracksStats";
import AdvancedRankingTable from "@/features/ranking/table/advanced/AdvancedRankingTable";
import { getLoggedAlbumNames } from "@/db/album";

export default async function page({ params, searchParams }: pageProps) {
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
		<AdvancedRankingTable
			data={trackRankings}
			columnKey={[
				"ranking",
				"name",
				"peak",
				"worst",
				"averageRanking",
				"top50PercentCount",
				"top25PercentCount",
				"top5PercentCount",
			]}
			availableAlbums={albums.map((album) => album.name)}
			features={{
				sort: true,
				search: true,
				virtualization: true,
				columnSelector: true,
				advancedFilter: true,
				header: true,
			}}
		/>
	);
}
