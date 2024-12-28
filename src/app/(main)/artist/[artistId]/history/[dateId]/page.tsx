import React from "react";
import { auth } from "@/../auth";
import { getTrackRankingHistory } from "@/lib/data/ranking/history/getTrackRankingHistory";
import RankingNavButton from "@/components/display/ranking/RankingNavButton";
import TrackRankingChart from "@/components/display/ranking/TrackRankingChart";

export default async function ArtistRankingPage({
	params,
}: {
	params: Promise<{ artistId: string; dateId: string }>;
}) {
	const dateId = (await params).dateId;
	const artistId = (await params).artistId;

	const session = await auth();
	if (!session) return null;

	const userId = session.user.id;

	const tracksRankings = await getTrackRankingHistory({
		artistId,
		userId,
		dateId,
	});

	return (
		<>
			<TrackRankingChart datas={tracksRankings} />
			<RankingNavButton
				type="backward"
				label="Back"
				link={`/artist/${artistId}/history?date=${dateId}`}
			/>
		</>
	);
}
