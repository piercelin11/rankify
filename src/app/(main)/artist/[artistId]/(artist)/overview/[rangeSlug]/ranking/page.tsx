import React from "react";
import { getUserSession } from "@/../auth";
import { calculateDateRangeFromSlug, dateToLong } from "@/lib/utils";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import getTracksStats, {
	TimeFilterType,
} from "@/lib/database/ranking/overview/getTracksStats";
import getArtistById from "@/lib/database/data/getArtistById";
import { headers } from "next/headers";
import AllTrackOverviewRankingList from "./_components/AllTrackOverviewRankingList";

export default async function ArtistRankingPage({
	params,
}: {
	params: Promise<{ artistId: string; rangeSlug: string }>;
}) {
	const { artistId, rangeSlug } = await params;
	const { id: userId } = await getUserSession();
	const startDate = calculateDateRangeFromSlug(rangeSlug);

	const time: TimeFilterType | undefined = startDate
		? {
				threshold: startDate,
				filter: "gte",
			}
		: undefined;

	const albums = await getLoggedAlbums({ artistId, userId });
	const artist = await getArtistById(artistId);
	const tracksRankings = await getTracksStats({
		artistId,
		userId,
		time,
		options: {
			includeRankChange: true,
			includeAllRankings: false,
			includeAchievement: true,
		},
	});

	const caption = startDate ? `${dateToLong(startDate)}  - now` : "all time";

	return (
		<>
			<AllTrackOverviewRankingList
				tracksRankings={tracksRankings}
				albums={albums}
				artist={artist}
				caption={caption}
			/>
		</>
	);
}
