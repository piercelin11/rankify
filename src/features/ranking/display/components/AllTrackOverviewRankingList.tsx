import getTracksStats, {
	TimeFilterType,
	TrackStatsType,
} from "@/lib/database/ranking/overview/getTracksStats";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import { dateToLong } from "@/lib/utils/helper";
import React from "react";
import { Column } from "./RankingList";
import TrackRankingList from "./TrackRankingList";

export default async function AllTrackOverviewRankingList({
	artistId,
	userId,
	startDate,
}: {
	artistId: string;
	userId: string;
	startDate: Date | undefined;
}) {
	const time: TimeFilterType | undefined = startDate ? {
		threshold: startDate,
		filter: "gte",
	} : undefined;

	const albums = await getLoggedAlbums({ artistId, userId });
	const tracksRankings = await getTracksStats({
		artistId,
		userId,
		time, 
		options: {
			includeRankChange: true,
			includeAllRankings: false,
		},
	});

	const title = startDate ? `${dateToLong(startDate)} - now` : "all time";

	const columns: Column<TrackStatsType>[] = [
		{
			key: "peak",
			header: "peak",
		},
		{
			key: "gap",
			header: "gap",
		},
		{
			key: "averageRanking",
			header: "avg",
		},
	];

	return (
		<TrackRankingList
			data={tracksRankings}
			columns={columns}
			albums={albums}
			title={title}
		/>
	);
}
