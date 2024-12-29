import React from "react";
import { auth } from "@/../auth";
import NavigationTabs from "@/components/menu/NavigationTabs";
import { getNavMenuData } from "@/config/menuData";
import DropdownMenu from "@/components/menu/DropdownMenu";
import getRankingSession from "@/lib/data/user/getRankingSession";
import { dateToDashFormat } from "@/lib/utils/helper";
import { getTracksRankingHistory } from "@/lib/data/ranking/history/getTracksRankingHistory";
import { getAlbumsRankingHistory } from "@/lib/data/ranking/history/getAlbumsRankingHistory";
import TopRankingList from "@/components/display/ranking/TopRankingList";
import { HistoryAlbumPointsChart } from "@/components/display/graphicChart/AlbumPointsChart";
import { AlbumInfoBox } from "@/components/display/showcase/InfoBox";
import TopSongsCountChart from "@/components/display/graphicChart/TopSongsCountChart";

export default async function ArtistHistoryPage({
	params,
	searchParams,
}: {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
	const artistId = (await params).artistId;

	const session = await auth();
	if (!session) return null;

	const userId = session.user.id;

	const rankingSessions = await getRankingSession({ artistId, userId });
	const dateId = (await searchParams).date || rankingSessions[0].id;
  const date = rankingSessions.find(session => session.id === dateId)?.date;

	const navMenuData = getNavMenuData(artistId);

	const trackRankings = await getTracksRankingHistory({
		artistId,
		userId,
		dateId,
		take: 5,
	});
	const albumRankings = await getAlbumsRankingHistory({
		artistId,
		userId,
		dateId,
	});

	const dateMenuData = rankingSessions.map((rankingSession) => ({
		label: dateToDashFormat(rankingSession.date),
		link: `?${new URLSearchParams({ date: rankingSession.id })}`,
	}));

  

	return (
		<div className="space-y-16">
			<div className="flex justify-between">
				<DropdownMenu
					menuData={dateMenuData}
					defaultValue={date ? dateToDashFormat(date) :dateToDashFormat(rankingSessions[0].date)}
				/>
				<NavigationTabs menuData={navMenuData} />
			</div>
			<TopRankingList
				datas={trackRankings}
				link={`/artist/${artistId}/history/${dateId}`}
			/>
			<div className="grid grid-flow-col grid-cols-2 grid-rows-2 gap-4">
				<AlbumInfoBox type="gainer" datas={albumRankings} />
				<AlbumInfoBox type="loser" datas={albumRankings} />
				<div className="row-span-2">
					<TopSongsCountChart datas={albumRankings} />
				</div>
			</div>

			<HistoryAlbumPointsChart datas={albumRankings} />
		</div>
	);
}
