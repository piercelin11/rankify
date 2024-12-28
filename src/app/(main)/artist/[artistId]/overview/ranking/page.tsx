import React from "react";
import { auth } from "@/../auth";
import getTrackStats from "@/lib/data/ranking/overall/getTrackStats";
import RankingListItem from "@/components/display/ranking/RankingListItem";
import RankingNavButton from "@/components/display/ranking/RankingNavButton";
import RankingListHeader from "@/components/display/ranking/RankingListHeader";
import TrackRankingChart from "@/components/display/ranking/TrackRankingChart";

export default async function ArtistRankingPage({
	params,
	searchParams,
}: {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ [key: string]: string }>;
}) {
	const artistId = (await params).artistId;
	const query = await searchParams;

	const session = await auth();
	if (!session) return null;

	const userId = session.user.id;

	const tracksRankings = await getTrackStats({
		artistId,
		userId,
		time: query,
	});

	return (
		<>
			<TrackRankingChart datas={tracksRankings} />
			<RankingNavButton
				type="backward"
				label="Back"
				link={`/artist/${artistId}/overview?${new URLSearchParams(query)}`}
			/>
		</>
	);
}
