import React, { Suspense } from "react";
import { getUserSession } from "@/../auth"; 
import getTracksStats, { TimeFilterType } from "@/lib/database/ranking/overview/getTracksStats";
import { getAlbumsStats } from "@/lib/database/ranking/overview/getAlbumsStats";
import DoubleBarChart from "@/components/charts/DoubleBarChart";
import Tabs from "@/components/menu/Tabs";
import DropdownMenu from "@/components/menu/DropdownMenu";
import NoData from "@/components/general/NoData";
import { dropdownMenuData, getNavMenuData } from "@/config/menuData";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import Link from "next/link";
import { ArrowTopRightIcon, PlusIcon } from "@radix-ui/react-icons";
import getRankingSession from "@/lib/database/user/getRankingSession";
import { getPastDate } from "@/lib/utils/helper";
import RankingTable from "@/features/ranking/display/components/RankingTable";
import RankingNavButton from "@/features/ranking/display/components/RankingNavButton";

export default async function ArtistOverViewPage({
	params,
	searchParams,
}: {
	params: Promise<{ artistId: string }>;
	searchParams: Promise<{ [key: string]: string }>;
}) {
	const artistId = (await params).artistId;
	const query = await searchParams;
	const { id: userId } = await getUserSession();

	const navMenuData = getNavMenuData(artistId);
	const rankingSessions = await getRankingSession({ artistId, userId });

	const dropdownDefaultValue =
		dropdownMenuData.find(
			(data) => JSON.stringify(data.query) === JSON.stringify(query)
		)?.label ?? "lifetime";

	return (
		<div className="space-y-16">
			<div className="flex flex-col md:items-center justify-between sm:flex-row gap-6">
				<DropdownMenu
					defaultValue={dropdownDefaultValue}
					menuData={dropdownMenuData}
				/>
				<div className="flex gap-4">
					<Tabs options={navMenuData} />
					<Link href={`/sorter/${artistId}`}>
						<div className="aspect-square rounded-full bg-lime-500 p-4 text-zinc-950 hover:bg-zinc-100">
							<PlusIcon width={16} height={16} />
						</div>
					</Link>
				</div>
			</div>
			<Suspense fallback={<LoadingAnimation />}>
				{rankingSessions.length !== 0 ? (
					<OverviewContents artistId={artistId} userId={userId} query={query} />
				) : (
					<NoData />
				)}
			</Suspense>
		</div>
	);
}

async function OverviewContents({
	artistId,
	userId,
	query,
}: {
	artistId: string;
	userId: string;
	query: { [key: string]: string };
}) {
	const time: TimeFilterType = {
		threshold: getPastDate(query),
		filter: "gte"
	}

	const trackRankings = await getTracksStats({
		artistId,
		userId,
		take: 5,
		time,
	});
	const albumRankings = await getAlbumsStats({
		artistId,
		userId,
		time,
	});

	return (
		<>
			<div className="space-y-6">
				<h3>Track Rankings</h3>
				<RankingTable data={trackRankings} hasHeader={false} columns={[]} />
				<RankingNavButton
					link={`/artist/${artistId}/overview/ranking?${new URLSearchParams(query)}`}
				>
					View All Rankings
					<ArrowTopRightIcon />
				</RankingNavButton>
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
