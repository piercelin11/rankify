"use client";

import AdvancedRankingTable from "@/features/ranking/table/advanced/AdvancedRankingTable";
import { TrackStatsType } from "@/services/track/types";
import { useRouter } from "next/navigation";

type ClientAdvancedRankingTableProps = {
	trackRankings: TrackStatsType[];
	albums: string[];
};

export default function ClientAdvancedRankingTable({
	trackRankings,
	albums,
}: ClientAdvancedRankingTableProps) {
    const router = useRouter();
    function handleRowClick(item: TrackStatsType) {
        router.push(`/artist/${item.artistId}/track/${item.id}`);
    }

	return (
		<AdvancedRankingTable
			data={trackRankings}
			onRowClick={handleRowClick}
			columnKey={[
				"ranking",
				"name",
				"peak",
				"worst",
				"averageRanking",
				"top50PercentCount",
				"top25PercentCount",
				"top5PercentCount",
			]}
			availableAlbums={albums}
			features={{
				sort: true,
				search: true,
				virtualization: true,
				columnSelector: true,
				advancedFilter: true,
				header: true,
			}}
		/>
	);
}
