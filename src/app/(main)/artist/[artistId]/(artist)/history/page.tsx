import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import NavigationTabs from "@/components/menu/NavigationTabs";
import { getNavMenuData } from "@/config/menuData";
import DropdownMenu from "@/components/menu/DropdownMenu";
import getRankingSession from "@/lib/data/user/getRankingSession";
import { dateToDashFormat } from "@/lib/utils/helper";
import { getTracksRankingHistory } from "@/lib/data/ranking/history/getTracksRankingHistory";
import { getAlbumsRankingHistory } from "@/lib/data/ranking/history/getAlbumsRankingHistory";
import TopRankingList from "@/components/display/ranking/TopRankingList";
import { AlbumInfoBox } from "@/components/display/showcase/InfoBox";
import TopSongsCountChart from "@/components/display/graphicChart/TopSongsCountChart";
import DoubleBarChart from "@/components/chart/DoubleBarChart";
import NoData from "@/components/general/NoData";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";

export default async function ArtistHistoryPage({
	params,
	searchParams,
}: {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
	const artistId = (await params).artistId;

	const { id: userId } = await getUserSession();

	const rankingSessions = await getRankingSession({ artistId, userId });
	const dateId = (await searchParams).date || rankingSessions[0].id;
	const date = rankingSessions.find((session) => session.id === dateId)?.date;

	const navMenuData = getNavMenuData(artistId);

	const dateMenuData = rankingSessions.map((rankingSession) => ({
		label: dateToDashFormat(rankingSession.date),
		link: `?${new URLSearchParams({ date: rankingSession.id })}`,
	}));

	return (
		<div className="space-y-16">
			<div className="flex justify-between">
				<DropdownMenu
					menuData={dateMenuData}
					defaultValue={
						date
							? dateToDashFormat(date)
							: dateToDashFormat(rankingSessions[0].date)
					}
				/>
				<div className="flex gap-4">
					<NavigationTabs menuData={navMenuData} />
					<Link href={`/sorter/${artistId}`} replace>
						<div className="aspect-square rounded-full bg-lime-500 p-4 text-zinc-950 hover:bg-zinc-100">
							<PlusIcon width={16} height={16} />
						</div>
					</Link>
				</div>
			</div>
			<Suspense fallback={<LoadingAnimation />}>
				<HistoryContents artistId={artistId} userId={userId} dateId={dateId} />
			</Suspense>
		</div>
	);
}

async function HistoryContents({
	artistId,
	userId,
	dateId,
}: {
	artistId: string;
	userId: string;
	dateId: string;
}) {
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

	return (
		<>
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
			<div className="space-y-6">
				<h3>Album Points</h3>
				<div className="p-5">
					{albumRankings.length !== 0 ? (
						<DoubleBarChart
							data={{
								labels: albumRankings.map((album) => album.name),
								mainData: albumRankings.map((album) => album.totalPoints),
								subData: albumRankings.map(
									(album) => album.previousTotalPoints
								),
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
