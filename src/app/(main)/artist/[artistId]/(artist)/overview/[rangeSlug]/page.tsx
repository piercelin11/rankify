import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import DropdownMenu from "@/components/menu/DropdownMenu";
import NoData from "@/components/feedback/NoData";
import {
	getOverviewDropdownData,
} from "@/config/menuData";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import getRankingSession from "@/lib/database/user/getRankingSession";
import TrackOverviewListSection from "@/features/ranking/display/components/TrackOverviewListSection";
import AlbumOverviewPointsSection from "@/features/ranking/stats/components/AlbumOverviewPointsSection";
import { notFound } from "next/navigation";

export const ALLOWED_RANGE_SLUGS = [
	"past-month",
	"past-6-months",
	"past-year",
	"past-2-years",
	"all-time",
];

export default async function page({
	params,
}: {
	params: Promise<{ artistId: string; rangeSlug: string }>;
}) {
	const { artistId, rangeSlug } = await params;

	if (!ALLOWED_RANGE_SLUGS.includes(rangeSlug)) notFound();

	const { id: userId } = await getUserSession();

	const dropdownOptions = getOverviewDropdownData(artistId);
	const rankingSessions = await getRankingSession({ artistId, userId });

	const dropdownDefaultValue = rangeSlug.replace("-", " ");

	return (
		<div className="space-y-16">
			<Suspense fallback={<LoadingAnimation />}>
				<DropdownMenu
					options={dropdownOptions}
					defaultValue={dropdownDefaultValue}
				/>

				{rankingSessions.length !== 0 ? (
					<>
						<TrackOverviewListSection
							artistId={artistId}
							userId={userId}
							rangeSlug={rangeSlug}
						/>
						<AlbumOverviewPointsSection
							artistId={artistId}
							userId={userId}
							rangeSlug={rangeSlug}
						/>
					</>
				) : (
					<NoData />
				)}
			</Suspense>
		</div>
	);
}
