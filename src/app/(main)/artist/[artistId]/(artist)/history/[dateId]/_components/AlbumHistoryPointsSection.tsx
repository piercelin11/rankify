import DoubleBarChart from "@/components/charts/DoubleBarChart";
import { getAlbumsRankingHistory } from "@/lib/database/ranking/history/getAlbumsRankingHistory";

type AlbumHistoryPointsSectionProps = {
	artistId: string;
	userId: string;
	dateId: string;
};

export default async function AlbumHistoryPointsSection({
	artistId,
	userId,
	dateId,
}: AlbumHistoryPointsSectionProps) {
	const albumRankings = await getAlbumsRankingHistory({
		artistId,
		userId,
		dateId,
	});

	return (
		<section className="space-y-6 stats-card bg-glow">
			<h3>Album Points</h3>
			<div className="p-5">
				<DoubleBarChart
					data={{
						labels: albumRankings.map((album) => album.name),
						mainData: albumRankings.map((album) => album.totalPoints),
						subData: albumRankings.map((album) => album.totalBasePoints),
						color: albumRankings.map((album) => album.color),
					}}
				/>
			</div>
		</section>
	);
}
