import React from "react";
import RankingList from "./RankingList";
import Link from "next/link";
import Button from "@/components/buttons/Button";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import getTracksStats, {
	TimeFilterType,
} from "@/lib/database/ranking/overview/getTracksStats";
import { getPastDate } from "@/lib/utils/helper";

type TrackOverviewListSectionProps = {
	artistId: string;
	userId: string;
	query: { [key: string]: string };
};

export default async function TrackOverviewListSection({
	artistId,
	userId,
	query,
}: TrackOverviewListSectionProps) {
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

	return (
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
	);
}
