import { getUserSession } from "@/../auth";
import SimpleSegmentControl from "@/components/navigation/SimpleSegmentControl";
import { Card } from "@/components/ui/card";
import { ALBUM_SEGMENT_OPTIONS } from "@/config/segmentOptions";
import { getAlbumRanking, getAlbumComparisonOptions } from "@/db/album";
import RankingLineChart from "@/features/ranking/chart/RankingLineChart";
import { notFound } from "next/navigation";
import { getComparisonAlbumsData } from "./actions";
import StatsCard, { StatsCardProps } from "@/components/card/StatsCard";
import getAlbumsStats from "@/services/album/getAlbumsStats";
import { getScoreLabel } from "@/lib/utils/score.utils";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import getTracksStats from "@/services/track/getTracksStats";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function page({
	params,
}: {
	params: Promise<{ albumId: string; artistId: string }>;
}) {
	const albumId = (await params).albumId;
	const artistId = (await params).artistId;
	const { id: userId } = await getUserSession();

	const defaultAlbum = await getAlbumRanking({ userId, albumId });
	const { menuOptions } = await getAlbumComparisonOptions({ userId, artistId });

	if (!defaultAlbum) notFound();

	const albums = await getAlbumsStats({ userId, artistId });
	const albumStats = albums.find((album) => album.id === albumId);

	if (!albumStats) notFound();

	const albumTracks = (await getTracksStats({ userId, artistId })).filter(
		(track) => track.albumId === albumId
	);

	const statsCardItems: StatsCardProps[] = [
		{
			title: "Overall Ranking",
			value: `#${albumStats.rank}`,
			subtitle: `Avg. ranking is ${albumStats.averageRank}`,
			extra: `Top ${((albumStats.rank / albums.length) * 100).toFixed(0)}%`,
		},
		{
			title: "Album Points",
			value: `${albumStats.avgPoints}`,
			subtitle: `Avg. points per track is ${(albumStats.avgPoints / albumTracks.length).toFixed(1)}`,
			extra: getScoreLabel(albumStats.avgPoints),
		},
		{
			title: "Favorite Track",
			value: `${albumTracks[0].name}`,
			subtitle: `Peak at #${albumTracks[0].highestRank}`,
			extra: `#${albumTracks[0].rank}`,
		},
	];

	const currentIndex = albums.findIndex((album) => album.id === albumId);
	const prevAlbum = albums[currentIndex - 1] || albums[albums.length - 1]; // 如果是第一首，取最後一首
	const nextAlbum = albums[currentIndex + 1] || albums[0]; // 如果是最後一首，取第一首

	return (
		<div className="space-y-8">
			<SimpleSegmentControl
				options={ALBUM_SEGMENT_OPTIONS}
				defaultValue="artist"
				variant="primary"
			/>
			<div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
				{statsCardItems.map((item) => (
					<StatsCard
						key={item.title}
						title={item.title}
						value={item.value}
						subtitle={item.subtitle}
						extra={<Badge variant={"outline"}>{item.extra}</Badge>}
					/>
				))}
				<StatsCard>
					<div className="space-y-4">
						<AnimatedProgress
							value={(albumStats.top10PercentCount / albumTracks.length) * 100}
							label="Tracks in top 10% Rate"
						/>
						<AnimatedProgress
							value={(albumStats.top25PercentCount / albumTracks.length) * 100}
							label="Tracks in top 25% Rate"
						/>
						<AnimatedProgress
							value={(albumStats.top50PercentCount / albumTracks.length) * 100}
							label="Tracks in top 50% Rate"
						/>
					</div>
				</StatsCard>
			</div>
			<Card className="space-y-8 p-12">
				<RankingLineChart
					title="Album Trends"
					defaultData={defaultAlbum}
					menuOptions={menuOptions}
					config={{
						dataKey: "ranking",
						isReverse: true,
						hasToggle: true,
						toggleOptions: [
							{
								label: "Album Ranking",
								value: "ranking",
								dataKey: "ranking",
								isReverse: true,
							},
							{
								label: "Album Points",
								value: "points",
								dataKey: "points",
								isReverse: false,
							},
						],
					}}
					onLoadComparisonData={getComparisonAlbumsData}
				/>
			</Card>
			<div className="flex justify-between">
				<Link href={`/artist/${artistId}/album/${prevAlbum.id}`}>
					<Button variant="outline" size="xl">
						<ArrowLeft /> {prevAlbum.name}
					</Button>
				</Link>
				<Link href={`/artist/${artistId}/album/${nextAlbum.id}`}>
					<Button variant="outline" size="xl">
						{nextAlbum.name} <ArrowRight />
					</Button>
				</Link>
			</div>
		</div>
	);
}
