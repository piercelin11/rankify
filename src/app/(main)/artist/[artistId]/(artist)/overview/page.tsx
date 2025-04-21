import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import Tabs from "@/components/navigation/Tabs";
import DropdownMenu from "@/components/menu/DropdownMenu";
import NoData from "@/components/feedback/NoData";
import { dropdownMenuData, getNavMenuData } from "@/config/menuData";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import getRankingSession from "@/lib/database/user/getRankingSession";
import TrackOverviewListSection from "@/features/ranking-display/components/TrackOverviewListSection";
import AlbumOverviewPointsSection from "@/features/ranking-stats/components/AlbumOverviewPointsSection";

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
					options={dropdownMenuData}
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
					<>
						<TrackOverviewListSection
							artistId={artistId}
							userId={userId}
							query={query}
						/>
						<AlbumOverviewPointsSection
							artistId={artistId}
							userId={userId}
							query={query}
						/>
					</>
				) : (
					<NoData />
				)}
			</Suspense>
		</div>
	);
}
