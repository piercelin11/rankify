"use client";

import { Card } from "@/components/ui/card";
import DoubleBarChart from "@/components/charts/DoubleBarChart";
import AlbumsSorterChecklist from "@/components/ranking/AlbumsSorterChecklist";
import type { ArtistDataSourceMode } from "@/types/artist";
import type { AlbumStatsType } from "@/types/album";
import type { Album } from "@prisma/client";

type AlbumSubmissionsData = Album & {
	sessionCount: number;
};

type Props = {
	mode: ArtistDataSourceMode;
	albumRankings?: AlbumStatsType[];
	albumSubmissions?: AlbumSubmissionsData[];
	artistId: string;
};

export default function OverviewView({
	mode,
	albumRankings,
	albumSubmissions,
	artistId,
}: Props) {
	if (mode === "snapshot") {
		return (
			<div className="p-content">
				<p className="text-muted-foreground">
					Snapshot Overview - 未來實作圖表視圖
				</p>
			</div>
		);
	}

	if (!albumRankings || !albumSubmissions) {
		return null;
	}

	return (
		<section className="space-y-6">
			<AlbumsSorterChecklist albums={albumSubmissions} artistId={artistId} />

			<Card className="p-12">
				<h2 className="mb-4">Your Album Points</h2>
				<DoubleBarChart
					labels={albumRankings.map((album) => album.name)}
					datasets={[
						{
							label: "points",
							data: albumRankings.map((album) => album.avgPoints),
							hoverColor: albumRankings.map((album) => album.color ?? "#464748"),
						},
						{
							label: "base points",
							data: albumRankings.map((album) => album.avgBasePoints),
							color: "#464748BF",
							hoverColor: albumRankings.map((album) => album.color ?? "#464748"),
						},
					]}
				/>
			</Card>
		</section>
	);
}
