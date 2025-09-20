"use client";

import RankingTable from "@/features/ranking/table/RankingTable";
import type { TrackStatsType } from "@/services/track/types";
import { useRouter } from "next/navigation";

type ClientRankingTableProps = {
	trackRankings: TrackStatsType[];
	albums: string[];
};

export default function ClientRankingTable({
	trackRankings,
	albums,
}: ClientRankingTableProps) {
    const router = useRouter();
    function handleRowClick(item: TrackStatsType) {
        router.push(`/artist/${item.artistId}/track/${item.id}`);
    }

	return (
		<RankingTable
			data={trackRankings}
			onRowClick={handleRowClick}
			columnKey={[
				"peak",
				"worst",
				"averageRanking",
				"top50PercentCount",
				"top25PercentCount",
				"top5PercentCount",
			]}
			availableAlbums={albums}
		/>
	);
}
