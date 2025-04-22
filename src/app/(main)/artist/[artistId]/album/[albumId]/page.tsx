import { notFound } from "next/navigation";
import React from "react";
import { getUserSession } from "@/../auth";
import { getAlbumsStats } from "@/lib/database/ranking/overview/getAlbumsStats";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import {
	DiscIcon,
	HeartFilledIcon,
	StarFilledIcon,
} from "@radix-ui/react-icons";
import { getPrevNextIndex } from "@/lib/utils/helper";
import AlbumRankingLineChart from "@/features/ranking/display/charts/AlbumRankingLineChart";
import getTracksStats from "@/lib/database/ranking/overview/getTracksStats";
import SiblingNavigator from "@/features/ranking/display/components/SiblingNavigator";
import PercentileBars, { BarData } from "@/features/ranking/stats/components/PercentileBars";
import StatsCard from "@/features/ranking/stats/components/StatsCard";

const iconSize = 22;

export default async function TrackPage({
	params,
}: {
	params: Promise<{ albumId: string; artistId: string }>;
}) {
	const albumId = (await params).albumId;
	const artistId = (await params).artistId;
	const { id: userId } = await getUserSession();

	const albumStats = await getAlbumsStats({
		artistId,
		userId,
	});
	const topTrack = (
		await getTracksStats({
			artistId,
			userId,
		})
	).find((track) => track.albumId === albumId);
	const albumData = albumStats.find((album) => album.id === albumId);
	if (!albumData) notFound();

	const menuOptions = await getLoggedAlbums({ artistId, userId });

	const statsBoxData = [
		{
			stats: "#" + albumData.ranking,
			subtitle: "overall ranking",
			color: albumData.color,
			icon: <HeartFilledIcon width={iconSize} height={iconSize} />,
		},
		{
			stats: albumData.totalPoints,
			subtitle: "average album points",
			icon: <StarFilledIcon width={iconSize} height={iconSize} />,
		},
		{
			stats: String(topTrack?.name),
			subtitle: "is your favorite track",
			icon: <DiscIcon width={iconSize} height={iconSize} />,
		},
	];

	const { top10PercentCount, top25PercentCount, top50PercentCount, tracks } =
		albumData;

	const barData: BarData[] = [
		{
			width: top10PercentCount / Number(tracks?.length),
			label: "Tracks in top 10%",
			stats: top10PercentCount,
		},
		{
			width: top25PercentCount / Number(tracks?.length),
			label: "Tracks in top 25%",
			stats: top25PercentCount,
		},
		{
			width: top50PercentCount / Number(tracks?.length),
			label: "Tracks in top 50%",
			stats: top50PercentCount,
		},
	];

	const { previousIndex, nextIndex } = getPrevNextIndex({
		data: albumStats,
		key: albumId,
	});

	return (
		<>
			<div className="grid grid-cols-2 gap-2 lg:grid-cols-2 lg:gap-6 xl:grid-cols-4">
				{statsBoxData.map((data) => (
					<StatsCard
						key={data.subtitle}
						stats={data.stats}
						subtitle={data.subtitle}
						color={data.color}
					>
						{data.icon}
					</StatsCard>
				))}
				<PercentileBars
					bars={barData}
					color={albumData.color}
					className="hidden sm:flex"
				/>
			</div>
			<div className="sm:hidden">
				<h3>Track Ranking Record</h3>
				<PercentileBars bars={barData} color={albumData.color} />
			</div>

			<AlbumRankingLineChart
				defaultAlbumData={albumData}
				allAlbumData={albumStats}
				menuOptions={menuOptions}
			/>
			<SiblingNavigator
				type="album"
				prevData={albumStats[previousIndex]}
				nextData={albumStats[nextIndex]}
			/>
		</>
	);
}
