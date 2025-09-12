import TopSongsCountpPolarAreaChart from "@/features/ranking/stats/charts/TopSongsCountpPolarAreaChart";
import { AlbumHighlightsCard } from "@/features/ranking/stats/components/RankingHighlightsCard";
import { getAlbumsRankingHistory } from "@/lib/database/ranking/history/getAlbumsRankingHistory";



type AlbumHistoryStatsSectionProps = {
	artistId: string;
	userId: string;
	dateId: string;
};

export default async function AlbumHistoryStatsSection({
	artistId,
	userId,
	dateId,
}: AlbumHistoryStatsSectionProps) {
	const albumRankings = await getAlbumsRankingHistory({
		artistId,
		userId,
		dateId,
		options: {
			includeChange: true
		}
	});

	return (
		<section className="gap-4 space-y-4 md:grid md:grid-flow-col md:grid-cols-2 md:grid-rows-2 md:space-y-0 2xl:gap-8">
			<AlbumHighlightsCard type="gainer" data={albumRankings} />
			<AlbumHighlightsCard type="loser" data={albumRankings} />
			<div className="md:row-span-2">
				<TopSongsCountpPolarAreaChart data={albumRankings} />
			</div>
		</section>
	);
}
