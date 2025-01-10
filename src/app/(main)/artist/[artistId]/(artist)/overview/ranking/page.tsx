import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import getTracksStats, {
	TimeFilterType,
	TrackStatsType,
} from "@/lib/database/ranking/overview/getTracksStats";
import RankingNavButton from "@/components/display/ranking/RankingNavButton";
import TrackRankingChart from "@/components/display/ranking/TrackRankingChart";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import { dropdownMenuData } from "@/config/menuData";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Column } from "@/components/display/ranking/RankingTable";
import { getPastDate } from "@/lib/utils/helper";

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
					link={`/artist/${artistId}/overview?${new URLSearchParams(query)}`}
				>
					<ArrowLeftIcon />
					Back
				</RankingNavButton>
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
	const time: TimeFilterType = {
		threshold: getPastDate(query),
		filter: "gte",
	};

	const albums = await getLoggedAlbums({ artistId, userId });
	const tracksRankings = await getTracksStats({
		artistId,
		userId,
		time,
	});

	const timeThreshold = dropdownMenuData.find(
		(data) => JSON.stringify(data.query) === JSON.stringify(query)
	)?.label;
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
			key: "totalChartRun",
			header: "chartrun",
		},
	];

	return (
		<TrackRankingChart
			data={tracksRankings}
			columns={columns}
			albums={albums}
			title={timeThreshold || "lifetime"}
		/>
	);
}
