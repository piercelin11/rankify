'use client';

import ClientStatsRankingTable from '@/features/ranking/table/client/ClientStatsRankingTable';
import ClientHistoryRankingTable from '@/features/ranking/table/client/ClientHistoryRankingTable';
import type { TrackStatsType, TrackHistoryType } from '@/types/track';

type Props =
	| {
			mode: 'average';
			trackRankings: TrackStatsType[];
			albums: string[];
	  }
	| {
			mode: 'snapshot';
			trackRankings: TrackHistoryType[];
			albums: string[];
	  };

export default function AllRankingsView({ mode, trackRankings, albums }: Props) {
	if (mode === 'average') {
		return <ClientStatsRankingTable trackRankings={trackRankings} albums={albums} />;
	}

	return <ClientHistoryRankingTable trackRankings={trackRankings} albums={albums} />;
}
