import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import Tabs from "@/components/menu/Tabs";
import { getNavMenuData } from "@/config/menuData";
import DropdownMenu from "@/components/menu/DropdownMenu";
import getRankingSession from "@/lib/database/user/getRankingSession";
import { dateToDashFormat } from "@/lib/utils/helper";
import { getTracksRankingHistory } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { getAlbumsRankingHistory } from "@/lib/database/ranking/history/getAlbumsRankingHistory";
import { AlbumInfoBox } from "@/components/display/showcase/InfoBox";
import TopSongsCountChart from "@/components/display/graphicChart/TopSongsCountChart";
import DoubleBarChart from "@/components/chartjs/DoubleBarChart";
import NoData from "@/components/general/NoData";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import Link from "next/link";
import { ArrowTopRightIcon, PlusIcon } from "@radix-ui/react-icons";
import RankingTable from "@/components/display/ranking/RankingTable";
import RankingNavButton from "@/components/display/ranking/RankingNavButton";

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
	const dateId = (await searchParams).date || rankingSessions[0]?.id;
	const date = rankingSessions.find((session) => session.id === dateId)?.date;

	const navMenuData = getNavMenuData(artistId);

	const dateMenuData = rankingSessions.map((rankingSession) => ({
		id: rankingSession.id,
		label: dateToDashFormat(rankingSession.date),
		href: `?${new URLSearchParams({ date: rankingSession.id })}`,
	}));

	return (
		<div className="space-y-16">
			<div className="flex flex-col md:items-center justify-between sm:flex-row gap-6">
				<DropdownMenu
					menuData={dateMenuData}
					defaultValue={
						date
							? dateToDashFormat(date)
							: dateToDashFormat(rankingSessions[0]?.date)
					}
				/>
				<div className="flex gap-4">
					<Tabs menuData={navMenuData} />
					<Link href={`/sorter/${artistId}`}>
						<div className="aspect-square rounded-full bg-lime-500 p-4 text-zinc-950 hover:bg-zinc-100">
							<PlusIcon width={16} height={16} />
						</div>
					</Link>
				</div>
			</div>
			<Suspense fallback={<LoadingAnimation />}>
				{rankingSessions.length !== 0 ? (
					<HistoryContents
						artistId={artistId}
						userId={userId}
						dateId={dateId}
					/>
				) : (
					<NoData />
				)}
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
			<section className="space-y-6">
				<h3>Track Rankings</h3>
				<RankingTable data={trackRankings} hasHeader={false} columns={[]} />
				<RankingNavButton link={`/artist/${artistId}/history/${dateId}`}>
					View All Rankings
					<ArrowTopRightIcon />
				</RankingNavButton>
			</section>
			<div className="gap-4 space-y-4 md:grid md:grid-flow-col md:grid-cols-2 md:grid-rows-2 md:space-y-0 2xl:gap-8">
				<AlbumInfoBox type="gainer" data={albumRankings} />
				<AlbumInfoBox type="loser" data={albumRankings} />
				<div className="md:row-span-2">
					<TopSongsCountChart data={albumRankings} />
				</div>
			</div>
			<div className="space-y-6">
				<h3>Album Points</h3>
				<div className="p-5">
					<DoubleBarChart
						data={{
							labels: albumRankings.map((album) => album.name),
							mainData: albumRankings.map((album) => album.totalPoints),
							subData: albumRankings.map((album) => album.rawTotalPoints),
							color: albumRankings.map((album) => album.color),
						}}
					/>
				</div>
			</div>
		</>
	);
}
