import React, { Suspense } from "react";
import { getUserSession } from "@/../auth";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { calculateDateRangeFromSlug } from "@/lib/utils/helper";
import Link from "next/link";
import Button from "@/components/buttons/Button";
import AllTrackOverviewRankingList from "@/features/ranking/display/components/AllTrackOverviewRankingList";

export default async function ArtistRankingPage({
	params,
}: {
	params: Promise<{ artistId: string; rangeSlug: string }>;
}) {
	const {artistId, rangeSlug} = await params;
	const { id: userId } = await getUserSession();
	const {startDate} = calculateDateRangeFromSlug(rangeSlug)

	return (
		<>
			<Suspense fallback={<LoadingAnimation />}>
				<AllTrackOverviewRankingList
					artistId={artistId}
					startDate={startDate}
					userId={userId}
				/>
				<Link
					href={`/artist/${artistId}/overview/${rangeSlug}`}
				>
					<Button variant="ghost" className="mx-auto">
						<ArrowLeftIcon />
						Back
					</Button>
				</Link>
			</Suspense>
		</>
	);
}
