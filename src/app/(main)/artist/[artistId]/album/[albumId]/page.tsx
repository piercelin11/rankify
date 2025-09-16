import { notFound } from "next/navigation";

import { getUserSession } from "@/../auth";
import { getAlbumsStats } from "@/lib/database/ranking/overview/getAlbumsStats";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import {
	DiscIcon,
	HeartFilledIcon,
	StarFilledIcon,
} from "@radix-ui/react-icons";
import { getPrevNextIndex } from "@/lib/utils";
import AlbumRankingLineChart from "@/features/ranking/display/charts/AlbumRankingLineChart";
import getTracksStats from "@/lib/database/ranking/overview/getTracksStats";
import SiblingNavigator from "@/features/ranking/display/components/SiblingNavigator";
import PercentileBarsCard, { BarData } from "@/features/ranking/stats/components/PercentileBarsCard";
import StatsCard from "@/features/ranking/stats/components/StatsCard";
import { db } from "@/db/client";

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
		options: {
			includeAllRankings: true
		}
	});
	const topTrack = (
		await getTracksStats({
			artistId,
			userId,
		})
	).find((track) => track.albumId === albumId);
	const albumData = albumStats.find((album) => album.id === albumId);
	if (!albumData) notFound();

	const trackLength = (await db.track.findMany({
		where: {
			albumId,
			artistId,
			rankings: {
				some: {
					userId
				}
			}
		},
		select: {
			id: true
		}
	})).length;

	const menuOptions = await getLoggedAlbums({ artistId, userId });

	const statsBoxData = [
		{
			stats: "#" + albumData.ranking,
			subtitle: "overall ranking",
			color: albumData.color,
			icon: <HeartFilledIcon width={iconSize} height={iconSize} />,
		},
		{
			stats: albumData.avgPoints,
			subtitle: "average album points",
			icon: <StarFilledIcon width={iconSize} height={iconSize} />,
		},
		{
			stats: String(topTrack?.name),
			subtitle: "is your favorite track",
			icon: <DiscIcon width={iconSize} height={iconSize} />,
		},
	];

	const { top10PercentCount, top25PercentCount, top50PercentCount, rankings } =
		albumData;

	const barData: BarData[] = [
		{
			width: (top10PercentCount / Number(rankings?.length)) / trackLength,
			label: "Tracks in top 10%",
			stats: Math.ceil(top10PercentCount / Number(rankings?.length)),
		},
		{
			width: (top25PercentCount / Number(rankings?.length)) / trackLength,
			label: "Tracks in top 25%",
			stats: Math.ceil(top25PercentCount / Number(rankings?.length)),
		},
		{
			width: (top50PercentCount / Number(rankings?.length)) / trackLength,
			label: "Tracks in top 50%",
			stats: Math.ceil(top50PercentCount / Number(rankings?.length)),
		},
	];

	const { previousIndex, nextIndex } = getPrevNextIndex({
		items: albumStats,
		targetItemId: albumId,
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
				<PercentileBarsCard
					bars={barData}
					color={albumData.color}
					className="hidden sm:flex"
				/>
			</div>
			<div className="sm:hidden">
				<h3>Track Ranking Record</h3>
				<PercentileBarsCard bars={barData} color={albumData.color} />
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
