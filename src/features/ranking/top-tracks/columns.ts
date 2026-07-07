import type { TrackStatsType } from "@/types/track";

export type TopTracksColumnKey = keyof Pick<TrackStatsType, "highestRank">;

export type TopTracksColumnConfig = {
	key: TopTracksColumnKey;
	header: string;
};

export const TOP_TRACKS_COLUMNS: Record<TopTracksColumnKey, TopTracksColumnConfig> = {
	highestRank: { key: "highestRank", header: "Peak" },
};
