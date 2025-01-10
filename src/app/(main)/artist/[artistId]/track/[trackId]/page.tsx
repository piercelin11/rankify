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
import TimesInTopPercentBar from "@/components/display/graphicChart/TimesInTopPercentBar";
import TrackRankingLineChart from "@/components/display/graphicChart/TrackRankingsLineChart";
import Link from "next/link";
import MultiTagDropdown from "@/components/menu/MultiTagDropdown";
import getLoggedTracks from "@/lib/database/user/getLoggedTracks";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import { AlbumStatsType } from "@/lib/database/ranking/overview/getAlbumsStats";
import { getPrevNextIndex } from "@/lib/utils/helper";

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

	const { top50PercentCount, top25PercentCount, top5PercentCount } = trackData;

	const topPercentBarData = [
		{ count: top5PercentCount, threshold: 5 },
		{ count: top25PercentCount, threshold: 25 },
		{ count: top50PercentCount, threshold: 50 },
	];

	const { previousIndex, nextIndex } = getPrevNextIndex({
			data: trackStats,
			key: trackId,
		});

	return (
		<>
			<div className="flex gap-6">
				<StatsBox
					stats={"#" + trackData.ranking}
					subtitle="overall ranking"
					color={trackData.album?.color}
				>
					<HeartFilledIcon width={iconSize} height={iconSize} />
				</StatsBox>
				<StatsBox stats={"#" + trackData.peak} subtitle="peak position">
					<StarFilledIcon width={iconSize} height={iconSize} />
				</StatsBox>

				<StatsBox
					stats={trackData.totalChartRun}
					subtitle="total chartrun"
				>
					<RocketIcon width={iconSize} height={iconSize} />
				</StatsBox>
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
			<div className="space-y-20 p-6">
				<div className="flex items-center justify-between">
					<h3>Track Chart Run</h3>
					<MultiTagDropdown
						defaultTag={{ ...trackData, color: trackData.album?.color || null }}
						menuLists={menuLists}
						parentLists={parentLists}
					/>
				</div>
				<TrackRankingLineChart
					defaultData={trackData}
					allTracksStats={trackStats}
				/>
			</div>
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

export function NavButton({
	data,
	direction,
}: {
	data: TrackStatsType | AlbumStatsType;
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
