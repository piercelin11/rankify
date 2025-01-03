import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import getTracksStats from "@/lib/data/ranking/overview/getTracksStats";
import RankingNavButton from "@/components/display/ranking/RankingNavButton";
import TrackRankingChart from "@/components/display/ranking/TrackRankingChart";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import { dropdownMenuData } from "@/config/menuData";

export default async function ArtistRankingPage({
	params,
	searchParams,
}: {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ [key: string]: string }>;
}) {
	const artistId = (await params).artistId;
	const query = await searchParams;
	const { id: userId } = await getUserSession();

	return (
		<>
			<Suspense fallback={<LoadingAnimation />}>
				<OverviewRankingChart
					artistId={artistId}
					query={query}
					userId={userId}
				/>

				<RankingNavButton
					type="backward"
					label="Back"
					link={`/artist/${artistId}/overview?${new URLSearchParams(query)}`}
				/>
			</Suspense>
		</>
	);
}

async function OverviewRankingChart({
	artistId,
	userId,
	query,
}: {
	artistId: string;
	userId: string;
	query: { [key: string]: string };
}) {
	const tracksRankings = await getTracksStats({
		artistId,
		userId,
		time: query,
	});

	const dropdownDefaultValue =
		dropdownMenuData.find(
			(data) => JSON.stringify(data.query) === JSON.stringify(query)
		)?.label ?? "lifetime";

	return (
		<TrackRankingChart datas={tracksRankings} title={dropdownDefaultValue} />
	);
}
