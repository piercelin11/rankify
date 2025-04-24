import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import getRankingSession from "@/lib/database/user/getRankingSession";
import { dateToDashFormat } from "@/lib/utils/helper";
import NoData from "@/components/feedback/NoData";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import TrackHistoryList from "@/features/ranking/display/components/TrackHistoryListSection";
import { notFound } from "next/navigation";
import AlbumHistoryStatsSection from "@/features/ranking/stats/components/AlbumHistoryStatsSection";
import DropdownMenu from "@/components/menu/DropdownMenu";
import AlbumHistoryPointsSection from "@/features/ranking/stats/components/AlbumHistoryPointsSection";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";

export default async function page({
	params,
}: {
	params: Promise<{ artistId: string; dateId: string }>;
}) {
	const artistId = (await params).artistId;
	const dateId = (await params).dateId;

	const { id: userId } = await getUserSession();

	const rankingSessions = await getRankingSession({ artistId, userId });
	const currentDate = rankingSessions.find((session) => session.id === dateId);

	if (!currentDate) notFound();

	const dropdownOptions = rankingSessions.map((rankingSession) => ({
		id: rankingSession.id,
		label: dateToDashFormat(rankingSession.date),
		href: rankingSession.id,
	}));

	return (
		<div className="space-y-16">
			<Suspense fallback={<LoadingAnimation />}>
				<div className="flex gap-4">
					<DropdownMenu
						options={dropdownOptions}
						defaultValue={dateToDashFormat(currentDate.date)}
					/>
					<Link href={`/sorter/${artistId}`}>
						<div className="aspect-square rounded-full bg-primary-500 p-4 text-neutral-950 hover:bg-neutral-100">
							<PlusIcon width={20} height={20} />
						</div>
					</Link>
				</div>

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
						<AlbumHistoryPointsSection
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
