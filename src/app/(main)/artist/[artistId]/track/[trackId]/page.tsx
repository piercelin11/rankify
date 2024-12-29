import getTracksStats from "@/lib/data/ranking/overview/getTracksStats";
import { notFound } from "next/navigation";
import React from "react";
import { auth } from "@/../auth";
import {
	PinBottomIcon,
	RocketIcon,
	StarFilledIcon,
} from "@radix-ui/react-icons";
import { LineChart } from "@/components/chart/LineChart";
import { dateToDashFormat } from "@/lib/utils/helper";
import TrackStatsBox from "@/components/display/showcase/TrackStatsBox";
import TimesInTopPercentBar from "@/components/display/graphicChart/TimesInTopPercentBar";
import TrackRankingsLineChart from "@/components/display/graphicChart/TrackRankingsLineChart";

const iconSize = 22;

export default async function TrackPage({
	params, 
}: {
	params: Promise<{ trackId: string, artistId: string }>;
}) {
	const trackId = (await params).trackId;
	const artistId = (await params).artistId;
	const session = await auth();
	if (!session) return null;
	const userId = session.user.id;

	const trackStats = await getTracksStats({ artistId, userId });
	const trackData = trackStats.find(
		(trackStats) => trackStats.id === trackId
	);
	if (!trackData) notFound();

	const { top50PercentCount, top25PercentCount, top5PercentCount } =
		trackData;

	const topPercentBarData = [
		{ count: top5PercentCount, threshold: 5 },
		{ count: top25PercentCount, threshold: 25 },
		{ count: top50PercentCount, threshold: 50 },
	];

	return (
		<>
			<div className="flex gap-6">
				<TrackStatsBox
					stats={"#" + trackData.peak}
					subtitle="peak position"
				>
					<StarFilledIcon width={iconSize} height={iconSize} />
				</TrackStatsBox>
				<TrackStatsBox
					stats={"#" + trackData.worst}
					subtitle="worst position"
				>
					<PinBottomIcon width={iconSize} height={iconSize} />
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
			<TrackRankingsLineChart defaultData={trackData} allTracksStats={trackStats} />
		</>
	);
}
