import React from "react";
import { getUserSession } from "@/../auth";
import { getTracksRankingHistory } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { dateToLong } from "@/lib/utils/helper";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Button from "@/components/buttons/Button";
import Link from "next/link";
import AllTrackHistoryRankingList from "@/features/ranking/display/components/AllTrackHistoryRankingList";

export default async function ArtistRankingPage({
	params,
}: {
	params: Promise<{ artistId: string; dateId: string }>;
}) {
	const dateId = (await params).dateId;
	const artistId = (await params).artistId;

	const { id: userId } = await getUserSession();

	const tracksRankings = await getTracksRankingHistory({
		artistId,
		userId,
		dateId,
		options: {
			includeAchievement: true,
		},
	});
	const albums = await getLoggedAlbums({
		artistId,
		userId,
		time: {
			threshold: tracksRankings[0].date,
			filter: "equals",
		},
	});

	const title = `${albums[0].artist.name} • ${dateToLong(tracksRankings[0].date)}`;

	return (
		<>
			<AllTrackHistoryRankingList
				tracksRankings={tracksRankings}
				albums={albums}
				title={title}
			/>
			<Link href={`/artist/${artistId}/history?date=${dateId}`}>
				<Button variant="ghost" className="mx-auto">
					<ArrowLeftIcon />
					Back
				</Button>
			</Link>
		</>
	);
}
