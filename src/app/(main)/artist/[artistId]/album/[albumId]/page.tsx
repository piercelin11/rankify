import { notFound } from "next/navigation";
import React from "react";
import { getUserSession } from "@/../auth";
import { getAlbumsStats } from "@/lib/database/ranking/overview/getAlbumsStats";
import MultiTagDropdown from "@/components/menu/MultiTagDropdown";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import { NavButtons } from "../../track/[trackId]/page";
import StatsBox from "@/components/display/showcase/StatsBox";
import {
	DiscIcon,
	HeartFilledIcon,
	StarFilledIcon,
} from "@radix-ui/react-icons";
import { getPrevNextIndex } from "@/lib/utils/helper";
import AlbumRankingLineChart from "@/components/display/graphicChart/AlbumRankingLineChart";
import HorizontalBarChart, {
	BarData,
} from "@/components/display/graphicChart/HorizontalBarChart";
import getTracksStats from "@/lib/database/ranking/overview/getTracksStats";

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

	const menuLists = await getLoggedAlbums({ artistId, userId });

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
			<div className="flex gap-6">
				{statsBoxData.map((data) => (
					<StatsBox
						key={data.subtitle}
						stats={data.stats}
						subtitle={data.subtitle}
						color={data.color}
					>
						{data.icon}
					</StatsBox>
				))}
				<HorizontalBarChart bars={barData} color={albumData.color} />
			</div>
			<AlbumRankingLineChart defaultData={albumData} allStats={albumStats}>
				<MultiTagDropdown defaultTag={albumData} menuLists={menuLists} />
			</AlbumRankingLineChart>
			<NavButtons
				artistId={artistId}
				type="album"
				prevData={albumStats[previousIndex]}
				nextData={albumStats[nextIndex]}
			/>
		</>
	);
}
