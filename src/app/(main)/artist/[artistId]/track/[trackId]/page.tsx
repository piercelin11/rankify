import getTracksStats, {
	TrackStatsType,
} from "@/lib/data/ranking/overview/getTracksStats";
import { notFound } from "next/navigation";
import React from "react";
import { getUserSession } from "@/../auth";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	HeartFilledIcon,
	RocketIcon,
	StarFilledIcon,
} from "@radix-ui/react-icons";
import TrackStatsBox from "@/components/display/showcase/TrackStatsBox";
import TimesInTopPercentBar from "@/components/display/graphicChart/TimesInTopPercentBar";
import TrackRankingLineChart from "@/components/display/graphicChart/TrackRankingsLineChart";
import Link from "next/link";

const iconSize = 22;

export default async function TrackPage({
	params,
}: {
	params: Promise<{ trackId: string; artistId: string }>;
}) {
	const trackId = (await params).trackId;
	const artistId = (await params).artistId;
	const { id: userId } = await getUserSession();

	const trackStats = await getTracksStats({ artistId, userId });
	const trackData = trackStats.find((trackStats) => trackStats.id === trackId);
	if (!trackData) notFound();

	const { top50PercentCount, top25PercentCount, top5PercentCount } = trackData;

	const topPercentBarData = [
		{ count: top5PercentCount, threshold: 5 },
		{ count: top25PercentCount, threshold: 25 },
		{ count: top50PercentCount, threshold: 50 },
	];

	const currentIndex = trackStats.findIndex((data) => data.id === trackId);
	const previousIndex =
		currentIndex !== 0 ? currentIndex - 1 : trackStats.length - 1;
	const nextIndex =
		currentIndex !== trackStats.length - 1 ? currentIndex + 1 : 0;

	return (
		<>
			<div className="flex gap-6">
				<TrackStatsBox
					stats={"#" + trackData.ranking}
					subtitle="overall ranking"
					color={trackData.album?.color}
				>
					<HeartFilledIcon width={iconSize} height={iconSize} />
				</TrackStatsBox>
				<TrackStatsBox stats={"#" + trackData.peak} subtitle="peak position">
					<StarFilledIcon width={iconSize} height={iconSize} />
				</TrackStatsBox>

				<TrackStatsBox
					stats={trackData.totalChartRun}
					subtitle="total chartrun"
				>
					<RocketIcon width={iconSize} height={iconSize} />
				</TrackStatsBox>
				<div className="flex flex-1 flex-col justify-between rounded-3xl bg-zinc-900 p-8">
					{topPercentBarData.map((data) => (
						<TimesInTopPercentBar
							key={data.threshold}
							threshold={data.threshold}
							count={data.count}
							trackLoggedCount={trackData.rankings.length}
							color={trackData.album?.color}
						/>
					))}
				</div>
			</div>
			<TrackRankingLineChart
				defaultData={trackData}
				allTracksStats={trackStats}
			/>
			<div className="mb-30 flex items-center justify-between">
				<Link
					href={`/artist/${artistId}/track/${trackStats[previousIndex].id}`}
				>
					<NavButton data={trackStats[previousIndex]} direction="backward" />
				</Link>
				<Link href={`/artist/${artistId}/track/${trackStats[nextIndex].id}`}>
					<NavButton data={trackStats[nextIndex]} direction="forward" />
				</Link>
			</div>
		</>
	);
}

function NavButton({
	data,
	direction,
}: {
	data: TrackStatsType;
	direction: "forward" | "backward";
}) {
	return (
		<div className="flex items-center gap-6 rounded-lg bg-zinc-900 px-8 py-6 hover:bg-zinc-800">
			{direction === "backward" ? (
				<>
					<ChevronLeftIcon className="self-center" width={25} height={25} />
					<p>{data.name}</p>
				</>
			) : (
				<>
					<p>{data.name}</p>
					<ChevronRightIcon className="self-center" width={25} height={25} />
				</>
			)}
		</div>
	);
}
