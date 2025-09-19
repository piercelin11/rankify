import { getUserSession } from "@/../auth";
import SimpleSegmentControl from "@/components/navigation/SimpleSegmentControl";
import { Card } from "@/components/ui/card";
import { TRACK_SEGMENT_OPTIONS } from "@/config/segmentOptions";
import { getTrackRanking, getTrackComparisonOptions } from "@/db/track";
import RankingLineChart from "@/features/ranking/chart/RankingLineChart";
import { notFound } from "next/navigation";
import { getComparisonTracksData } from "./actions";
import { Button } from "@/components/ui/button";
import getTracksStats from "@/services/track/getTracksStats";
import { getPeakRankings } from "@/db/ranking";
import StatsCard from "@/components/card/StatsCard";
import { dateToDashFormat } from "@/lib/utils";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default async function page({
	params,
}: {
	params: Promise<{ trackId: string; artistId: string }>;
}) {
	const trackId = (await params).trackId;
	const artistId = (await params).artistId;
	const { id: userId } = await getUserSession();

	const defaultTrack = await getTrackRanking(userId, trackId);
	const { menuOptions, parentOptions } = await getTrackComparisonOptions(
		userId,
		artistId
	);

	if (!defaultTrack) notFound();

	const tracks = await getTracksStats({ userId, artistId });
	const trackStats = tracks.find((track) => track.id === trackId);

	if (!trackStats) notFound();

	const peakSessions = await getPeakRankings(trackStats.peak, trackId, userId);

	// 找到當前歌曲在排名中的位置
	const currentIndex = tracks.findIndex((track) => track.id === trackId);
	const prevTrack = tracks[currentIndex - 1] || tracks[tracks.length - 1]; // 如果是第一首，取最後一首
	const nextTrack = tracks[currentIndex + 1] || tracks[0]; // 如果是最後一首，取第一首

	const statsCardItems = [
		{
			title: "Overall Ranking",
			value: `#${trackStats.ranking}`,
			subtitle: `Avg. ranking is ${trackStats.averageRanking}`,
			badge: {
				text: `Top ${((trackStats.ranking / tracks.length) * 100).toFixed(0)}%`,
			},
		},
		{
			title: "Peak Position",
			value: `#${trackStats.peak}`,
			subtitle: `First hit peak at ${dateToDashFormat(peakSessions[0].date)}`,
			badge: {
				text: `x${peakSessions.length}`,
			},
		},
		{
			title: "Ranking Range",
			value: trackStats.gap
				? `#${trackStats.peak} - #${trackStats.worst}`
				: `#${trackStats.peak} - TBD`,
			subtitle: `The gap is ${trackStats.gap}`,
			badge: {
				text: `Covers ${trackStats.gap ? ((trackStats.gap / tracks.length) * 100).toFixed(2) : 0}%`,
			},
		},
	];

	return (
		<div className="space-y-8">
			<SimpleSegmentControl
				options={TRACK_SEGMENT_OPTIONS}
				defaultValue="artist"
				variant="primary"
			/>
			<div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
				{statsCardItems.map((item) => (
					<StatsCard
						key={item.title}
						title={item.title}
						value={item.value}
						subtitle={item.subtitle}
						badge={item.badge}
					/>
				))}
				<StatsCard>
					<div className="space-y-4">
						<AnimatedProgress
							value={
								(trackStats.top5PercentCount / trackStats.sessionCount) * 100
							}
							label="Top 5% Rate"
						/>
						<AnimatedProgress
							value={
								(trackStats.top25PercentCount / trackStats.sessionCount) * 100
							}
							label="Top 25% Rate"
						/>
						<AnimatedProgress
							value={
								(trackStats.top50PercentCount / trackStats.sessionCount) * 100
							}
							label="Top 50% Rate"
						/>
					</div>
				</StatsCard>
			</div>
			<Card className="space-y-8 p-12">
				<RankingLineChart
					title="Track Ranking Trends"
					defaultData={defaultTrack}
					menuOptions={menuOptions}
					parentOptions={parentOptions}
					config={{
						dataKey: "ranking",
						isReverse: true,
						hasToggle: false,
					}}
					onLoadComparisonData={getComparisonTracksData}
				/>
			</Card>
			<div className="flex justify-between">
				<Link href={`/artist/${artistId}/track/${prevTrack.id}`}>
					<Button variant="outline" size="xl">
						<ArrowLeft /> {prevTrack.name}
					</Button>
				</Link>
				<Link href={`/artist/${artistId}/track/${nextTrack.id}`}>
					<Button variant="outline" size="xl">
						{nextTrack.name} <ArrowRight />
					</Button>
				</Link>
			</div>
		</div>
	);
}
