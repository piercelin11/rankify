
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { getTracksRankingHistory } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { RankingListItem } from "@/features/ranking/display/components/RankingList.old";

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
		<section>
			<h3 className="mb-6">Track Rankings</h3>
			{trackRankings.map((track) => (
				<RankingListItem key={track.id} data={track} columns={[]} />
			))}
			<Link href={`/artist/${artistId}/history/${dateId}/ranking`}>
				<Button variant="ghost" className="mx-auto">
					View All Rankings
					<ArrowTopRightIcon />
				</Button>
			</Link>
		</section>
	);
}
