import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import { getArtistTabOptions } from "@/config/menuData";
import getRankingSession from "@/lib/database/user/getRankingSession";
import { dateToDashFormat } from "@/lib/utils/helper";
import NoData from "@/components/feedback/NoData";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import TrackHistoryList from "@/features/ranking/display/components/TrackHistoryListSection";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import AlbumHistoryStatsSection from "@/features/ranking/stats/components/AlbumHistoryStatsSection";
import ArtistSectionControls from "@/features/ranking/components/ArtistSectionControls";

export default async function page({
	params,
}: {
	params: Promise<{ artistId: string; dateId: string }>;
}) {
	const artistId = (await params).artistId;
	const dateId = (await params).dateId;

	const headerList = headers();
	const pathname = (await headerList).get("x-current-path");
	const activePathname = pathname?.split("/")[3];

	const { id: userId } = await getUserSession();

	const rankingSessions = await getRankingSession({ artistId, userId });
	const currentDate = rankingSessions.find((session) => session.id === dateId);

	if (!currentDate) notFound();

	const tabOptions = getArtistTabOptions(artistId);

	const dropdownOptions = rankingSessions.map((rankingSession) => ({
		id: rankingSession.id,
		label: dateToDashFormat(rankingSession.date),
		href: rankingSession.id,
	}));

	return (
		<div className="space-y-16">
			<ArtistSectionControls
				artistId={artistId}
				dropdownOptions={dropdownOptions}
				dropdownDefaultValue={dateToDashFormat(currentDate.date)}
				tabOptions={tabOptions}
				tabsActiveId={activePathname || ""}
			/>
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
						<AlbumHistoryStatsSection
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
