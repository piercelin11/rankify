"use client";

import { Card } from "@/components/ui/card";
import DoubleBarChart from "@/components/charts/DoubleBarChart";
import AlbumsSorterChecklist from "@/features/sorter/components/AlbumsSorterChecklist";
import type { AlbumStatsType } from "@/types/album";
import type { Album } from "@prisma/client";
import StatsCard from "@/components/card/StatsCard";
import { TrackStatsType } from "@/types/track";
import Image from "next/image";
import { PLACEHOLDER_PIC } from "@/constants";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import aggregateOverviewHighlight from "@/services/ranking/aggregateOverviewHighlight";

type AlbumSubmissionsData = Album & {
	sessionCount: number;
};

type Props = {
	albumStats: AlbumStatsType[];
	albumSubmissions: AlbumSubmissionsData[];
	trackStats: TrackStatsType[];
};

export default function OverviewView({
	albumStats,
	albumSubmissions,
	trackStats,
}: Props) {
	const top3Tracks = trackStats.slice(0, 3);

	const statsCardItems = aggregateOverviewHighlight({
		trackStats,
		albumStats,
	});

	return (
		<div>
			<AlbumsSorterChecklist
				albums={albumSubmissions}
				artistId={trackStats[0].artistId}
			/>
			<div className="py-6">
				<hr className="border-border/50" />
			</div>
			<div className="mb-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
				<StatsCard className="box-content h-[230px] space-y-2">
					{top3Tracks.map((track) => (
						<Link
							key={track.id}
							href={`/artist/${track.artistId}/track/${track.id}`}
						>
							<div className="flex items-center gap-2 group">
								<p className="min-w-4 font-numeric text-lg text-secondary-foreground">
									{track.overallRank}
								</p>
								<Image
									src={track.img || PLACEHOLDER_PIC}
									alt={`${track.name} cover`}
									className="rounded-md"
									width={60}
									height={60}
								/>
								<div className="overflow-hidden">
									<p className="truncate text-md font-semibold group-hover:underline">{track.name}</p>
									<p className="truncate text-sm text-muted-foreground">
										{track.album?.name}
									</p>
								</div>
							</div>
						</Link>
					))}
					<Link
						href={`/artist/${trackStats[0].artistId}/my-stats?view=all-rankings`}
						className="ml-auto flex items-center gap-1 text-sm text-secondary-foreground hover:text-foreground"
					>
						Full rankings
						<ArrowRight size={16} />
					</Link>
				</StatsCard>
				{statsCardItems.map((item) => (
					<StatsCard
						className="box-content h-[230px]"
						key={item.title}
						title={item.title}
						value={item.value}
						subtitle={item.subtitle}
						extra={item.extra}
						backgroundImg={item.backgroundImg}
					/>
				))}
			</div>

			<Card className="bg-card/80 p-6">
				<h2 className="mb-4">Your Album Points</h2>
				<DoubleBarChart
					labels={albumStats.map((album) => album.name)}
					datasets={[
						{
							label: "points",
							data: albumStats.map((album) => album.avgPoints),
							hoverColor: albumStats.map((album) => album.color ?? "#464748"),
						},
						{
							label: "base points",
							data: albumStats.map((album) => album.avgPoints),
							color: "#464748BF",
							hoverColor: albumStats.map((album) => album.color ?? "#464748"),
						},
					]}
				/>
			</Card>
		</div>
	);
}
