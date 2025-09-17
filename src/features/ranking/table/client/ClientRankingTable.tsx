"use client";

import type { TrackStatsType } from "@/services/track/types";
import { useRouter } from "next/navigation";
import RankingTable from "../RankingTable";

type ClientRankingTableProps = {
	trackRankings: TrackStatsType[];
};

export default function ClientRankingTable({
	trackRankings,
}: ClientRankingTableProps) {
	const router = useRouter();
	function handleRowClick(item: TrackStatsType) {
		router.push(`/artist/${item.artistId}/track/${item.id}`);
	}

	return (
		<RankingTable
			className="mb-4 border-b border-neutral-800"
			features={{
				header: false,
			}}
			data={trackRankings}
			onRowClick={handleRowClick}
		/>
	);
}
