"use client";

//import AdvancedRankingTable from "@/features/ranking/table/advanced/AdvancedRankingTable";
import type { TrackStatsType } from "@/services/track/types";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";


const AdvancedRankingTable = dynamic(
	() => import("@/features/ranking/table/advanced/AdvancedRankingTable"), // 請確保路徑正確
	{ ssr: false }
);

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
