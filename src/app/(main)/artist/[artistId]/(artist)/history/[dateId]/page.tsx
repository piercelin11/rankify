import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import { getTracksRankingHistory, TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import RankingNavButton from "@/components/display/ranking/RankingNavButton";
import TrackRankingChart from "@/components/display/ranking/TrackRankingChart";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import { dateToLong } from "@/lib/utils/helper";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import { ArrowLeftIcon, ArrowTopRightIcon } from "@radix-ui/react-icons";

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
					link={`/artist/${artistId}/history?date=${dateId}`}
				>
					<ArrowLeftIcon />
					Back
				</RankingNavButton>
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
	const albums = await getLoggedAlbums({ artistId, userId });
	const tracksRankings = await getTracksRankingHistory({
		artistId,
		userId,
		dateId,
	});

	const columns: {
			key: keyof TrackHistoryType;
			header: string;
		}[] = [
			{
				key: "peak",
				header: "peak",
			},
		];

	return (
		<TrackRankingChart
			data={tracksRankings}
			albums={albums}
			columns={columns}
			title={dateToLong(tracksRankings[0].date.date)}
		/>
	);
}
