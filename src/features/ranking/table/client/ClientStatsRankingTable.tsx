"use client";

import RankingTable, { AdvancedTableFeatures } from "@/features/ranking/table/RankingTable";
import type { TrackStatsType } from "@/types/track";
import { useRouter } from "next/navigation";

type ClientStatsRankingTableProps = {
	trackRankings: TrackStatsType[];
	albums: string[];
	features?: AdvancedTableFeatures
};

export default function ClientStatsRankingTable({
	trackRankings,
	albums,
	features
}: ClientStatsRankingTableProps) {
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
			features={features}
		/>
	);
}
