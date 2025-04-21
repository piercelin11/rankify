import getTracksStats from "@/lib/database/ranking/overview/getTracksStats";
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
import StatsBox from "@/features/ranking-stats/components/StatsCard";
import Link from "next/link";
import getLoggedTracks from "@/lib/database/user/getLoggedTracks";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import { getPrevNextIndex } from "@/lib/utils/helper";
import PercentileBars, {
	BarData,
} from "@/features/ranking-stats/components/PercentileBars";
import TrackRankingLineChart from "@/features/ranking-display/charts/TrackRankingLineChart";
import SiblingNavigator from "@/features/ranking-display/components/SiblingNavigator";

const iconSize = 22;

export default async function page({
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

	const menuOptions = (await getLoggedTracks({ artistId, userId })).map(
		(track) => ({
			...track,
			parentId: track.albumId,
			color: track.album?.color || null,
		})
	);
	const parentOptions = await getLoggedAlbums({ artistId, userId });

	const statsCardData = [
		{
			stats: "#" + trackData.ranking,
			subtitle: "overall ranking",
			color: trackData.album?.color,
			icon: <HeartFilledIcon width={iconSize} height={iconSize} />,
		},
		{
			stats: "#" + trackData.peak,
			subtitle: "peak position",
			icon: <StarFilledIcon width={iconSize} height={iconSize} />,
		},
		{
			stats: trackData.totalChartRun,
			subtitle: "total chartrun",
			icon: <RocketIcon width={iconSize} height={iconSize} />,
		},
	];

	const {
		top50PercentCount,
		top25PercentCount,
		top5PercentCount,
		loggedCount,
	} = trackData;

	const barData: BarData[] = [
		{
			width: top5PercentCount / loggedCount,
			label: "Times in top 5%",
			stats: top5PercentCount,
		},
		{
			width: top25PercentCount / loggedCount,
			label: "Times in top 25%",
			stats: top25PercentCount,
		},
		{
			width: top50PercentCount / loggedCount,
			label: "Times in top 50%",
			stats: top50PercentCount,
		},
	];

	const { previousIndex, nextIndex } = getPrevNextIndex({
		data: trackStats,
		key: trackId,
	});

	return (
		<>
			<div className="grid grid-cols-2 gap-2 lg:grid-cols-2 lg:gap-6 xl:grid-cols-4">
				{statsCardData.map((data) => (
					<StatsBox
						key={data.subtitle}
						stats={data.stats}
						subtitle={data.subtitle}
						color={data.color}
					>
						{data.icon}
					</StatsBox>
				))}
				<PercentileBars
					bars={barData}
					color={trackData.album?.color}
					className="hidden sm:flex"
				/>
			</div>
			<div className="sm:hidden">
				<h3>Track Ranking Record</h3>
				<PercentileBars
					bars={barData}
					color={trackData.album?.color}
				/>
			</div>

			<TrackRankingLineChart
				defaultTrackData={trackData}
				allTrackData={trackStats}
				menuOptions={menuOptions}
				parentOptions={parentOptions}
			/>
			<SiblingNavigator
				type="track"
				prevData={trackStats[previousIndex]}
				nextData={trackStats[nextIndex]}
			/>
		</>
	);
}
