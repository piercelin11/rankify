import React from "react";
import RankingList from "./RankingList";
import Link from "next/link";
import Button from "@/components/buttons/Button";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { getTracksRankingHistory } from "@/lib/database/ranking/history/getTracksRankingHistory";

type TrackHistoryListSectionProps = {
	artistId: string;
	userId: string;
	dateId: string;
};

export default async function TrackHistoryListSection({
	artistId,
	userId,
	dateId,
}: TrackHistoryListSectionProps) {
	const trackRankings = await getTracksRankingHistory({
		artistId,
		userId,
		dateId,
		take: 5,
	});

	return (
		<section className="space-y-6">
			<h3>Track Rankings</h3>
			<RankingList data={trackRankings} hasHeader={false} columns={[]} />
			<Link href={`/artist/${artistId}/history/${dateId}/ranking`}>
				<Button variant="ghost" className="mx-auto">
					View All Rankings
					<ArrowTopRightIcon />
				</Button>
			</Link>
		</section>
	);
}
