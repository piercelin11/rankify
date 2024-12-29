import React from "react";
import { auth } from "@/../auth";
import getTracksStats from "@/lib/data/ranking/overview/getTracksStats";
import RankingListItem from "@/components/display/ranking/RankingListItem";
import { getAlbumsStats } from "@/lib/data/ranking/overview/getAlbumsStats";
import DoubleBarChart from "@/components/chart/DoubleBarChart";
import NavigationTabs from "@/components/menu/NavigationTabs";
import DropdownMenu from "@/components/menu/DropdownMenu";
import NoData from "@/components/general/NoData";
import { dropdownMenuData, getNavMenuData } from "@/config/menuData";
import RankingNavButton from "@/components/display/ranking/RankingNavButton";
import TopRankingList from "@/components/display/ranking/TopRankingList";
import { db } from "@/lib/prisma";

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
	const trackRankings = await getTracksStats({
		artistId,
		userId,
		take: 5,
		time: query,
	});
	const albumRankings = await getAlbumsStats({
		artistId,
		userId,
		time: query,
	});

	return (
		<div className="space-y-16">
			<div className="flex justify-between">
				<DropdownMenu defaultValue="lifetime" menuData={dropdownMenuData} />
				<NavigationTabs menuData={navMenuData} />
			</div>
			<TopRankingList
				datas={trackRankings}
				link={`/artist/${artistId}/overview/ranking?${new URLSearchParams(query)}`}
			/>
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
		</div>
	);
}
