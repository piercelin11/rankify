import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import getTracksStats from "@/lib/data/ranking/overview/getTracksStats";
import { getAlbumsStats } from "@/lib/data/ranking/overview/getAlbumsStats";
import DoubleBarChart from "@/components/chart/DoubleBarChart";
import NavigationTabs from "@/components/menu/NavigationTabs";
import DropdownMenu from "@/components/menu/DropdownMenu";
import NoData from "@/components/general/NoData";
import { dropdownMenuData, getNavMenuData } from "@/config/menuData";
import TopRankingList from "@/components/display/ranking/TopRankingList";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";

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

	const dropdownDefaultValue =
		dropdownMenuData.find(
			(data) => JSON.stringify(data.query) === JSON.stringify(query)
		)?.label ?? "lifetime";

	return (
		<div className="space-y-16">
			<div className="flex justify-between">
				<DropdownMenu
					defaultValue={dropdownDefaultValue}
					menuData={dropdownMenuData}
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
				<OverviewContents artistId={artistId} userId={userId} query={query} />
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
		<>
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
		</>
	);
}
