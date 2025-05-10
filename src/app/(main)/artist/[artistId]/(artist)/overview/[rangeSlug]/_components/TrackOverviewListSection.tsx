import React from "react";
import { RankingListItem } from "../../../../../../../../features/ranking/display/components/RankingList";
import Link from "next/link";
import Button from "@/components/buttons/Button";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import getTracksStats, {
	TimeFilterType,
} from "@/lib/database/ranking/overview/getTracksStats";
import { calculateDateRangeFromSlug } from "@/lib/utils";

type TrackOverviewListSectionProps = {
	artistId: string;
	userId: string;
	rangeSlug: string;
};

export default async function TrackOverviewListSection({
	artistId,
	userId,
	rangeSlug,
}: TrackOverviewListSectionProps) {
	const { startDate } = calculateDateRangeFromSlug(rangeSlug);
	const time: TimeFilterType | undefined = startDate
		? {
				threshold: startDate,
				filter: "gte",
			}
		: undefined;

	const trackRankings = await getTracksStats({
		artistId,
		userId,
		take: 5,
		time,
		options: {
			includeRankChange: true,
			includeAllRankings: false,
			includeAchievement: false
		},
	});

	return (
		<section>
			<h3 className="mb-6">Track Rankings</h3>
			{trackRankings.map((track) => (
				<RankingListItem key={track.id} data={track} columns={[]} />
			))}
			<Link href={`/artist/${artistId}/overview/${rangeSlug}/ranking`}>
				<Button variant="ghost" className="mx-auto">
					View All Rankings
					<ArrowTopRightIcon />
				</Button>
			</Link>
		</section>
	);
}
