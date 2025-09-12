import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import DropdownMenu from "@/components/menu/DropdownMenu";
import NoData from "@/components/feedback/NoData";
import { getOverviewDropdownData } from "@/config/navData";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import getRankingSession from "@/lib/database/user/getRankingSession";
import TrackOverviewListSection from "@/app/(main)/artist/[artistId]/(artist)/overview/[rangeSlug]/_components/TrackOverviewListSection";
import AlbumOverviewPointsSection from "@/app/(main)/artist/[artistId]/(artist)/overview/[rangeSlug]/_components/AlbumOverviewPointsSection";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";

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

	const dropdownDefaultValue = rangeSlug.replaceAll("-", " ");

	return (
		<div className="space-y-16">
			<Suspense fallback={<LoadingAnimation />}>
				<div className="flex gap-4">
					<DropdownMenu
						options={dropdownOptions}
						defaultValue={dropdownDefaultValue}
					/>
					<Link href={`/sorter/${artistId}`}>
						<div className="aspect-square rounded-full bg-neutral-100-500 p-3 text-neutral-950 hover:bg-neutral-100">
							<PlusIcon width={20} height={20} />
						</div>
					</Link>
				</div>

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
