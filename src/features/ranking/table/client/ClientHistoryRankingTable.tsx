"use client";

import RankingTable, { AdvancedTableFeatures } from "@/features/ranking/table/RankingTable";
import type { TrackHistoryType } from "@/types/track";
import { useRouter } from "next/navigation";

type ClientHistoryRankingTableProps = {
	trackRankings: TrackHistoryType[];
	albums: string[];
	features?: AdvancedTableFeatures;
};

export default function ClientHistoryRankingTable({
	trackRankings,
	albums,
	features
}: ClientHistoryRankingTableProps) {
	const router = useRouter();

	function handleRowClick(item: TrackHistoryType) {
		router.push(`/artist/${item.artistId}/track/${item.id}`);
	}

	const defaultFeatures: AdvancedTableFeatures = {
		sort: true,
		search: true,
		virtualization: true,
		timeRangeSelector: false, // 歷史頁面不需要時間範圍選擇
		columnSelector: false,   // 歷史頁面不需要欄位選擇
		advancedFilter: true,
		header: true,
	};

	return (
		<RankingTable
			data={trackRankings}
			onRowClick={handleRowClick}
			columnKey={[
				"ranking",
				"peak",
				"rankChange",
				"achievement",
			]}
			availableAlbums={albums}
			features={features || defaultFeatures}
		/>
	);
}