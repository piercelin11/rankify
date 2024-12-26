import React from "react";
import { auth } from "@/../auth";
import getTrackStats from "@/lib/data/ranking/overall/getTrackStats";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import RankingListItem from "@/components/ranking/RankingListItem";
import { getAlbumStats } from "@/lib/data/ranking/overall/getAlbumStats";
import DoubleBarChart from "@/components/chart/DoubleBarChart";
import NavigationTabs from "@/components/menu/NavigationTabs";
import DropdownMenu from "@/components/menu/DropdownMenu";
import NoData from "@/components/general/NoData";
import { dropdownMenuData, getNavMenuData } from "@/config/menuData";

export default async function ArtistOverViewPage({
	params,
	searchParams,
}: {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ [key: string]: string }>;
}) {
	const artistId = (await params).artistId;
	const query = await searchParams;

	const session = await auth();
	if (!session) return null;

	const userId = session.user.id;

	const navMenuData = getNavMenuData(artistId);
	const trackRankings = await getTrackStats({
		artistId,
		userId,
		take: 5,
		time: query,
	});
	const albumRankings = await getAlbumStats({
		artistId,
		userId,
		time: query,
	});

	return (
		<>
			<div className="flex justify-between">
				<DropdownMenu defaultValue="lifetime" menuData={dropdownMenuData} />
				<NavigationTabs menuData={navMenuData} />
			</div>
			<div className="space-y-6">
				<h3>Track Rankings</h3>

				{trackRankings.length !== 0 ? (
					<>
						<div>
							{trackRankings.map((track) => (
								<RankingListItem
									data={track}
									key={track.id}
									length={trackRankings.length}
								/>
							))}
						</div>
						<div className="flex w-full justify-center">
							<Link
								className="flex gap-2 text-zinc-500 hover:text-zinc-100"
								href={`/artist/${artistId}/overview/ranking?${new URLSearchParams(query)}`}
							>
								View All Rankings
								<ArrowTopRightIcon className="self-center" />
							</Link>
						</div>
					</>
				) : (
					<NoData />
				)}
			</div>
			<div className="space-y-6">
				<h3>Album Points</h3>
				<div className="p-5">
					{albumRankings.length !== 0 ? (
						<DoubleBarChart
							data={{
								labels: albumRankings.map((album) => album.name),
								mainData: albumRankings.map((album) => album.totalPoints),
								subData: albumRankings.map((album) => album.rawTotalPoints),
								color: albumRankings.map((album) => album.color),
							}}
							datasetLabels={{
								mainDataLabel: "points",
								subDataLabel: "raw points",
							}}
						/>
					) : (
						<NoData />
					)}
				</div>
			</div>
		</>
	);
}
