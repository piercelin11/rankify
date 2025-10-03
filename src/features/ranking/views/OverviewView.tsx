'use client';

import { Card } from '@/components/ui/card';
import DoubleBarChart from '@/components/charts/DoubleBarChart';
import AlbumRankingBoard from '@/components/ranking/AlbumRankingBoard';
import type { ArtistDataSourceMode } from '@/types/artist';
import type { AlbumStatsType } from '@/types/album';
import type { Album } from '@prisma/client';

type AlbumSessionData = Album & {
	sessionCount: number;
	trackRanks: {
		submission: {
			id: string;
		};
	}[];
};

type Props = {
	mode: ArtistDataSourceMode;
	albumRankings?: AlbumStatsType[];
	albumSessions?: AlbumSessionData[];
	artistId: string;
};

export default function OverviewView({
	mode,
	albumRankings,
	albumSessions,
	artistId,
}: Props) {
	if (mode === 'snapshot') {
		return (
			<div className="p-content">
				<p className="text-muted-foreground">
					Snapshot Overview - 未來實作圖表視圖
				</p>
			</div>
		);
	}

	if (!albumRankings || !albumSessions) {
		return null;
	}

	return (
		<div className="space-y-6 p-content">
			<div>
				<h2 className="mb-4 text-2xl font-bold">專輯儀表板</h2>
				<AlbumRankingBoard albums={albumSessions} artistId={artistId} />
			</div>
			<div>
				<Card className="p-12">
					<h2 className="mb-4">Your Recent Rankings</h2>
					<DoubleBarChart
						data={{
							labels: albumRankings.map((album) => album.name),
							mainData: albumRankings.map((album) => album.avgPoints),
							subData: albumRankings.map((album) => album.avgBasePoints),
							color: albumRankings.map((album) => album.color),
						}}
					/>
				</Card>
			</div>
		</div>
	);
}
