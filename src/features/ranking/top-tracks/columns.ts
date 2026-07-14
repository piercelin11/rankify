export type TopTracksColumnKey = "highestRank" | "peak";

export type TopTracksColumnConfig = {
	key: TopTracksColumnKey;
	header: string;
};

export const TOP_TRACKS_COLUMNS: Record<TopTracksColumnKey, TopTracksColumnConfig> = {
	highestRank: { key: "highestRank", header: "Peak" },
	peak: { key: "peak", header: "Peak" },
};
