import getTracksStats from "@/lib/database/ranking/overview/getTracksStats";
import { notFound } from "next/navigation";

import { getUserSession } from "@/../auth";
import {
	HeartFilledIcon,
	MoveIcon,
	StarFilledIcon,
} from "@radix-ui/react-icons";
import getLoggedTracks from "@/lib/database/user/getLoggedTracks";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import { getPrevNextIndex } from "@/lib/utils";
import TrackRankingLineChart from "@/features/ranking/display/charts/TrackRankingLineChart";
import SiblingNavigator from "@/features/ranking/display/components/SiblingNavigator";
import PercentileBarsCard, {
	BarData,
} from "@/features/ranking/stats/components/PercentileBarsCard";
import StatsCard from "@/features/ranking/stats/components/StatsCard";
import calculateTotalChartRun from "@/lib/database/ranking/overview/calculateTotalChartRun";

const iconSize = 22;

export default async function page({
	params,
}: {
	params: Promise<{ trackId: string; artistId: string }>;
}) {
	const trackId = (await params).trackId;
	const artistId = (await params).artistId;
	const { id: userId } = await getUserSession();

	const trackStats = await getTracksStats({
		artistId,
		userId,
		options: {
			includeAllRankings: true,
			includeRankChange: false,
		},
	});
	const trackData = trackStats.find((trackStats) => trackStats.id === trackId);
	if (!trackData) notFound();

	const totalChartRun = await calculateTotalChartRun({artistId,userId, trackId});

	const trackColor = trackData.album.color || trackData.color;

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
			color: trackColor,
			icon: <HeartFilledIcon width={iconSize} height={iconSize} />,
		},
		{
			stats: "#" + trackData.peak,
			subtitle: "peak position",
			icon: <StarFilledIcon width={iconSize} height={iconSize} />,
		},
		{
			stats: totalChartRun,
			subtitle: "total chart run",
			icon: <MoveIcon width={iconSize} height={iconSize} />,
		},
	];

	const { top50PercentCount, top25PercentCount, top5PercentCount, rankings } =
		trackData;

	const barData: BarData[] = [
		{
			width: top5PercentCount / rankings!.length,
			label: "Times in top 5%",
			stats: top5PercentCount,
		},
		{
			width: top25PercentCount / rankings!.length,
			label: "Times in top 25%",
			stats: top25PercentCount,
		},
		{
			width: top50PercentCount / rankings!.length,
			label: "Times in top 50%",
			stats: top50PercentCount,
		},
	];

	const { previousIndex, nextIndex } = getPrevNextIndex({
		items: trackStats,
		targetItemId: trackId,
	});

	return (
		<>
			<div className="grid grid-cols-2 gap-2 lg:grid-cols-2 lg:gap-6 xl:grid-cols-4">
				{statsCardData.map((data) => (
					<StatsCard
						key={data.subtitle}
						stats={data.stats}
						subtitle={data.subtitle}
						color={data.color}
					>
						{data.icon}
					</StatsCard>
				))}
				<PercentileBarsCard
					bars={barData}
					color={trackColor}
					className="hidden sm:flex"
				/>
			</div>
			<div className="sm:hidden">
				<h3>Track Ranking Record</h3>
				<PercentileBarsCard bars={barData} color={trackColor} />
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
