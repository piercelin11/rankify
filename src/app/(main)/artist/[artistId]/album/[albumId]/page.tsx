import { notFound } from "next/navigation";
import React from "react";
import { getUserSession } from "@/../auth";
import { getAlbumsStats } from "@/lib/database/ranking/overview/getAlbumsStats";
import MultiTagDropdown from "@/components/menu/MultiTagDropdown";
import getLoggedAlbums from "@/lib/database/user/getLoggedAlbums";
import AlbumRankingsLineChart from "@/components/display/graphicChart/AlbumRankingsLineChart";
import Link from "next/link";
import { NavButton } from "../../track/[trackId]/page";
import StatsBox from "@/components/display/showcase/StatsBox";
import {
	HeartFilledIcon,
	RocketIcon,
	StarFilledIcon,
} from "@radix-ui/react-icons";
import { getPrevNextIndex } from "@/lib/utils/helper";

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
	const albumData = albumStats.find((album) => album.id === albumId);
	if (!albumData) notFound();

	const menuLists = await getLoggedAlbums({ artistId, userId });

	const { previousIndex, nextIndex } = getPrevNextIndex({
		data: albumStats,
		key: albumId,
	});

	return (
		<>
			<div className="flex gap-6">
				<StatsBox
					stats={"#" + albumData.ranking}
					subtitle="overall ranking"
					color={albumData.color}
				>
					<HeartFilledIcon width={iconSize} height={iconSize} />
				</StatsBox>
				<StatsBox stats={albumData.totalPoints} subtitle="average points">
					<StarFilledIcon width={iconSize} height={iconSize} />
				</StatsBox>

				<StatsBox
					stats={albumData.rawTotalPoints}
					subtitle="raw average points"
				>
					<RocketIcon width={iconSize} height={iconSize} />
				</StatsBox>
			</div>
			<div className="space-y-20 p-6">
				<div className="flex items-center justify-between">
					<h3>Total Pointss Run</h3>
					<MultiTagDropdown defaultTag={albumData} menuLists={menuLists} />
				</div>
				<AlbumRankingsLineChart
					defaultData={albumData}
					allAlbumsStats={albumStats}
				/>
			</div>
			<div className="mb-30 flex items-center justify-between">
				<Link
					href={`/artist/${artistId}/album/${albumStats[previousIndex].id}`}
				>
					<NavButton data={albumStats[previousIndex]} direction="backward" />
				</Link>
				<Link href={`/artist/${artistId}/album/${albumStats[nextIndex].id}`}>
					<NavButton data={albumStats[nextIndex]} direction="forward" />
				</Link>
			</div>
		</>
	);
}
