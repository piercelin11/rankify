import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import getTracksStats, {
	TimeFilterType,
	TrackStatsType,
} from "@/lib/database/ranking/overview/getTracksStats";
import TrackRankingChart from "@/features/ranking-display/components/TrackRankingList";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import { dropdownMenuData } from "@/config/menuData";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Column } from "@/features/ranking-display/components/RankingList";
import { getPastDate } from "@/lib/utils/helper";
import Link from "next/link";
import Button from "@/components/buttons/Button";

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

				<Link
					href={`/artist/${artistId}/overview?${new URLSearchParams(query)}`}
				>
					<Button variant="ghost" className="mx-auto">
						<ArrowLeftIcon />
						Back
					</Button>
				</Link>
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
