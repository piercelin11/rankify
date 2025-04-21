import React from "react";
import { TimeFilterType } from "@/lib/database/ranking/overview/getTracksStats";
import { getPastDate } from "@/lib/utils/helper";
import DoubleBarChart from "@/components/charts/DoubleBarChart";
import { getAlbumsStats } from "@/lib/database/ranking/overview/getAlbumsStats";

type AlbumOverviewPointsSectionProps = {
	artistId: string;
	userId: string;
	query: { [key: string]: string };
};

export default async function AlbumOverviewPointsSection({
	artistId,
	userId,
	query,
}: AlbumOverviewPointsSectionProps) {
	const time: TimeFilterType = {
		threshold: getPastDate(query),
		filter: "gte",
	};

	const albumRankings = await getAlbumsStats({
		artistId,
		userId,
		time,
	});

	return (
		<div className="space-y-6">
			<h3>Album Points</h3>
			<div className="p-5">
				<DoubleBarChart
					data={{
						labels: albumRankings.map((album) => album.name),
						mainData: albumRankings.map((album) => album.totalPoints),
						subData: albumRankings.map((album) => album.rawTotalPoints),
						color: albumRankings.map((album) => album.color),
					}}
				/>
			</div>
		</div>
	);
}
