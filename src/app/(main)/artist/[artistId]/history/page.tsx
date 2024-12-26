import React from "react";
import { auth } from "@/../auth";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import RankingListItem from "@/components/ranking/RankingListItem";
import { getAlbumStats } from "@/lib/data/ranking/overall/getAlbumStats";
import DoubleBarChart from "@/components/chart/DoubleBarChart";
import NavigationTabs from "@/components/menu/NavigationTabs";
import NoData from "@/components/general/NoData";
import { dropdownMenuData, getNavMenuData } from "@/config/menuData";
import DropdownMenu from "@/components/menu/DropdownMenu";
import getRankingSession from "@/lib/data/user/getRankingSession";
import { dateToDashFormat } from "@/lib/utils/helper";
import { getTrackRankingHistory } from "@/lib/data/ranking/history/getTrackRankingHistory";
import { getAlbumRankingHistory } from "@/lib/data/ranking/history/getAlbumRankingHistory";

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
  const dateId = (await searchParams).date || rankingSessions[0].id

	const navMenuData = getNavMenuData(artistId);
	const trackRankings = await getTrackRankingHistory({
		artistId,
		userId,
    dateId,
    take: 5
	});
	const albumRankings = await getAlbumRankingHistory({
		artistId,
		userId,
    dateId
	});

  const dateMenuData = rankingSessions.map(rankingSession => ({
    label: dateToDashFormat(rankingSession.date),
    link: `?${new URLSearchParams({date: rankingSession.id})}`
  }))

	return (
		<>
			<div className="flex justify-between">
				<DropdownMenu menuData={dateMenuData} defaultValue={dateToDashFormat(rankingSessions[0].date)} />
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
								href={`/artist/${artistId}/history/${dateId}`}
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
								subData: albumRankings.map((album) => album.previousTotalPoints),
								color: albumRankings.map((album) => album.color),
							}}
              datasetLabels={{
								mainDataLabel: "points",
								subDataLabel: "previous points",
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
