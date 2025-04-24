import React from "react";
import { TimeFilterType } from "@/lib/database/ranking/overview/getTracksStats";
import DoubleBarChart from "@/components/charts/DoubleBarChart";
import { getAlbumsStats } from "@/lib/database/ranking/overview/getAlbumsStats";
import { calculateDateRangeFromSlug } from "@/lib/utils/helper";

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
		<div className="space-y-6 stats-card bg-gradient-to-b from-neutral-950/40 to-neutral-950">
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
