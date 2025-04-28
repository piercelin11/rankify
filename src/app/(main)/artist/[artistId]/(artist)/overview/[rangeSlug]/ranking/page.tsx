import React from "react";
import { getUserSession } from "@/../auth";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { calculateDateRangeFromSlug, dateToLong } from "@/lib/utils/helper";
import Link from "next/link";
import Button from "@/components/buttons/Button";
import AllTrackOverviewRankingList from "@/features/ranking/display/components/AllTrackOverviewRankingList";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import getTracksStats, {
	TimeFilterType,
} from "@/lib/database/ranking/overview/getTracksStats";
import getArtistById from "@/lib/database/data/getArtistById";

export default async function ArtistRankingPage({
	params,
}: {
	params: Promise<{ artistId: string; rangeSlug: string }>;
}) {
	const { artistId, rangeSlug } = await params;
	const { id: userId } = await getUserSession();
	const { startDate } = calculateDateRangeFromSlug(rangeSlug);

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
		},
	});

	return (
		<>
			<AllTrackOverviewRankingList
				tracksRankings={tracksRankings}
				albums={albums}
				artist={artist}
				onBackHref={`/artist/${artistId}/overview/${rangeSlug}`}
			/>
		</>
	);
}
