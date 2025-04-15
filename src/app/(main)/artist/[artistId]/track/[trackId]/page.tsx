import getTracksStats, {
	TrackStatsType,
} from "@/lib/database/ranking/overview/getTracksStats";
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
import StatsBox from "@/components/display/showcase/StatsBox";
import Link from "next/link";
import MultiTagDropdown from "@/components/menu/MultiTagDropdown";
import getLoggedTracks from "@/lib/database/user/getLoggedTracks";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import { AlbumStatsType } from "@/lib/database/ranking/overview/getAlbumsStats";
import { getPrevNextIndex } from "@/lib/utils/helper";
import RankingLineChart from "@/components/display/graphicChart/RankingLineChart";
import HorizontalBarChart, {
	BarData,
} from "@/components/display/graphicChart/HorizontalBarChart";

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

	const menuLists = (await getLoggedTracks({ artistId, userId })).map(
		(track) => ({
			...track,
			parentId: track.albumId,
			color: track.album?.color || null,
		})
	);
	const parentLists = await getLoggedAlbums({ artistId, userId });

	const statsBoxData = [
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
				<HorizontalBarChart
					bars={barData}
					color={trackData.album?.color}
					className="hidden sm:flex"
				/>
			</div>
			<div className="sm:hidden">
				<h3>Track Ranking Record</h3>
				<HorizontalBarChart bars={barData} color={trackData.album?.color} />
			</div>

			<div className="space-y-8 sm:space-y-20">
				<div className="flex flex-col justify-between sm:flex-row sm:items-center">
					<h3>Track Chart Run</h3>
					<MultiTagDropdown
						defaultTag={{ ...trackData, color: trackData.album?.color || null }}
						menuLists={menuLists}
						parentLists={parentLists}
					/>
				</div>
				<RankingLineChart
					defaultData={trackData}
					allStats={trackStats}
					dataKey={"ranking"}
					isReverse={true}
				/>
			</div>
			<NavButtons
				artistId={artistId}
				type="track"
				prevData={trackStats[previousIndex]}
				nextData={trackStats[nextIndex]}
			/>
		</>
	);
}

export function NavButton({
	data,
	direction,
}: {
	data: { id: string; name: string };
	direction: "forward" | "backward";
}) {
	return (
		<button className="flex items-center gap-3 rounded-lg bg-zinc-900 px-4 py-3 hover:bg-zinc-800 sm:gap-6 sm:px-8 sm:py-6">
			{direction === "backward" ? (
				<>
					<ChevronLeftIcon className="self-center" width={25} height={25} />
					<p className="text-left">{data.name}</p>
				</>
			) : (
				<>
					<p className="text-right">{data.name}</p>
					<ChevronRightIcon className="self-center" width={25} height={25} />
				</>
			)}
		</button>
	);
}

export function NavButtons({
	artistId,
	type,
	prevData,
	nextData,
}: {
	artistId: string;
	type: "track" | "album";
	prevData: { id: string; name: string };
	nextData: { id: string; name: string };
}) {
	return (
		<div className="mb-30 flex items-center justify-between gap-3">
			<Link href={`/artist/${artistId}/${type}/${prevData.id}`}>
				<NavButton data={prevData} direction="backward" />
			</Link>
			<Link href={`/artist/${artistId}/${type}/${nextData.id}`}>
				<NavButton data={nextData} direction="forward" />
			</Link>
		</div>
	);
}
