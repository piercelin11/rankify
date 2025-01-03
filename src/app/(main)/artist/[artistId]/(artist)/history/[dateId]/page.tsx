import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import { getTracksRankingHistory } from "@/lib/data/ranking/history/getTracksRankingHistory";
import RankingNavButton from "@/components/display/ranking/RankingNavButton";
import TrackRankingChart from "@/components/display/ranking/TrackRankingChart";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import { dateToLong } from "@/lib/utils/helper";

export default async function ArtistRankingPage({
	params,
}: {
	params: Promise<{ artistId: string; dateId: string }>;
}) {
	const dateId = (await params).dateId;
	const artistId = (await params).artistId;

	const { id: userId } = await getUserSession();

	return (
		<>
			<Suspense fallback={<LoadingAnimation />}>
				<HistoryRankingChart
					artistId={artistId}
					userId={userId}
					dateId={dateId}
				/>
				<RankingNavButton
					type="backward"
					label="Back"
					link={`/artist/${artistId}/history?date=${dateId}`}
				/>
			</Suspense>
		</>
	);
}

async function HistoryRankingChart({
	artistId,
	userId,
	dateId,
}: {
	artistId: string;
	userId: string;
	dateId: string;
}) {
	const tracksRankings = await getTracksRankingHistory({
		artistId,
		userId,
		dateId,
	});

	return (
		<TrackRankingChart
			datas={tracksRankings}
			title={dateToLong(tracksRankings[0].date.date)}
		/>
	);
}
