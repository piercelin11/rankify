import { StatsCardProps } from "@/components/card/StatsCard";
import { AlbumStatsType } from "@/types/album";
import { TrackStatsType } from "@/types/track";

type Props = {
	trackStats: TrackStatsType[];
	albumStats: AlbumStatsType[];
};

export default function aggregateOverviewHighlight({
	trackStats,
	albumStats,
}: Props): StatsCardProps[] {
	// 找出 Core Album (按 top25PercentCount 排序後的第一個)
	let coreAlbum: AlbumStatsType | null = null;
	let maxTop25Count = -1;

	for (const album of albumStats) {
		if (album.top25PercentCount > maxTop25Count) {
			maxTop25Count = album.top25PercentCount;
			coreAlbum = album;
		}
	}

	// 單次遍歷找出 Anchor Track 和 Star Track
	let anchorTrack: TrackStatsType | null = null;
	let starTrack: TrackStatsType | null = null;
	let minAnchorScore = Infinity;
	let maxStarScore = -1;

	for (const track of trackStats) {
		if (track.submissionCount >= 2) {
			const anchorScore = track.cumulativeRankChange / track.submissionCount;
			const starScore = track.top5PercentCount / track.submissionCount;

			if (anchorScore < minAnchorScore) {
				minAnchorScore = anchorScore;
				anchorTrack = track;
			}

			if (starScore > maxStarScore) {
				maxStarScore = starScore;
				starTrack = track;
			}
		}
	}

	// 錯誤處理：如果缺少數據，返回空陣列
	if (!coreAlbum || !anchorTrack || !starTrack) {
		return [];
	}

	return [
		{
			title: "Your Core Album",
			value: coreAlbum.name,
			subtitle: `Contributes ${coreAlbum.top50PercentCount} songs to your top 25%.`,
			backgroundImg: coreAlbum.img,
		},
		{
			title: "Your Anchor Track",
			value: anchorTrack.name,
			subtitle: `Average rank change is ${(anchorTrack.cumulativeRankChange / anchorTrack.submissionCount).toFixed(0)} spots.`,
			backgroundImg: anchorTrack.img,
		},
		{
			title: "Your Star Track",
			value: starTrack.name,
			subtitle: `Stayed in Top 5% for ${(starTrack.top5PercentCount / starTrack.submissionCount * 100).toFixed(0)}% of the times.`,
			backgroundImg: starTrack.img,
		},
	];
}
