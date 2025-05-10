import React from "react";
import { TimeFilterType } from "@/lib/database/ranking/overview/getTracksStats";
import DoubleBarChart from "@/components/charts/DoubleBarChart";
import { getAlbumsStats } from "@/lib/database/ranking/overview/getAlbumsStats";
import { calculateDateRangeFromSlug } from "@/lib/utils";

type AlbumOverviewPointsSectionProps = {
	artistId: string;
	userId: string;
	rangeSlug: string;
};

export default async function AlbumOverviewPointsSection({
	artistId,
	userId,
	rangeSlug,
}: AlbumOverviewPointsSectionProps) {
	const { startDate } = calculateDateRangeFromSlug(rangeSlug);
	const time: TimeFilterType | undefined = startDate
		? {
				threshold: startDate,
				filter: "gte",
			}
		: undefined;

	const albumRankings = await getAlbumsStats({
		artistId,
		userId,
		time,
	});

	return (
		<div className="stats-card bg-glow space-y-6">
			<h3>Album Points</h3>
			<div className="p-5">
				<DoubleBarChart
					data={{
						labels: albumRankings.map((album) => album.name),
						mainData: albumRankings.map((album) => album.avgPoints),
						subData: albumRankings.map((album) => album.avgBasePoints),
						color: albumRankings.map((album) => album.color),
					}}
				/>
			</div>
		</div>
	);
}
