import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import getTracksStats, {
	TimeFilterType,
} from "@/lib/database/ranking/overview/getTracksStats";
import { getAlbumsStats } from "@/lib/database/ranking/overview/getAlbumsStats";
import DoubleBarChart from "@/components/charts/DoubleBarChart";
import Tabs from "@/components/navigation/Tabs";
import DropdownMenu from "@/components/menu/DropdownMenu";
import NoData from "@/components/feedback/NoData";
import { dropdownMenuData, getNavMenuData } from "@/config/menuData";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import Link from "next/link";
import { ArrowTopRightIcon, PlusIcon } from "@radix-ui/react-icons";
import getRankingSession from "@/lib/database/user/getRankingSession";
import { getPastDate } from "@/lib/utils/helper";
import RankingList from "@/features/ranking-display/components/RankingList";
import Button from "@/components/buttons/Button";

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
			<div className="flex flex-col justify-between gap-6 sm:flex-row md:items-center">
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
		filter: "gte",
	};

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
				<RankingList data={trackRankings} hasHeader={false} columns={[]} />
				<Link
					href={`/artist/${artistId}/overview/ranking?${new URLSearchParams(query)}`}
				>
					<Button variant="ghost" className="mx-auto">
						View All Rankings
						<ArrowTopRightIcon />
					</Button>
				</Link>
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
