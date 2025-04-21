import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import Tabs from "@/components/navigation/Tabs";
import { getNavMenuData } from "@/config/menuData";
import DropdownMenu from "@/components/menu/DropdownMenu";
import getRankingSession from "@/lib/database/user/getRankingSession";
import { dateToDashFormat } from "@/lib/utils/helper";
import NoData from "@/components/feedback/NoData";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import TrackHistoryList from "@/features/ranking-display/components/TrackHistoryListSection";
import AlbumHistoryStatsSection from "@/features/ranking-stats/components/AlbumHistoryStatsSection";
import AlbumHistoryPointsChartSection from "@/features/ranking-stats/components/AlbumHistoryPointsSection";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export default async function page({
	params,
}: {
	params: Promise<{ artistId: string; dateId: string }>;
}) {
	const artistId = (await params).artistId;
	const dateId = (await params).dateId;

	const headerList = headers();
	const pathname = (await headerList).get("x-current-path");

	console.log(pathname)

	const { id: userId } = await getUserSession();

	const rankingSessions = await getRankingSession({ artistId, userId });
	const currentDate = rankingSessions.find((session) => session.id === dateId);

	if (!currentDate) notFound();

	const navMenuData = getNavMenuData(artistId);

	const dropdownOptions = rankingSessions.map((rankingSession) => ({
		id: rankingSession.id,
		label: dateToDashFormat(rankingSession.date),
		href: rankingSession.id,
	}));

	return (
		<div className="space-y-16">
			<div className="flex flex-col justify-between gap-6 sm:flex-row md:items-center">
				<DropdownMenu
					options={dropdownOptions}
					defaultValue={dateToDashFormat(currentDate.date)}
				/>
				<div className="flex gap-4">
					<Tabs activeId={""} options={navMenuData} />
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
						<TrackHistoryList
							artistId={artistId}
							userId={userId}
							dateId={dateId}
						/>
						<AlbumHistoryStatsSection
							artistId={artistId}
							userId={userId}
							dateId={dateId}
						/>
						<AlbumHistoryPointsChartSection
							artistId={artistId}
							userId={userId}
							dateId={dateId}
						/>
					</>
				) : (
					<NoData />
				)}
			</Suspense>
		</div>
	);
}
