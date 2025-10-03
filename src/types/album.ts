import { AlbumData } from "@/types/data";

export type AlbumStatsType = Omit<AlbumData, "tracks"> & {
	ranking: number;
	averageRanking: number | string;
	top5PercentCount: number;
	top10PercentCount: number;
	top25PercentCount: number;
	top50PercentCount: number;
	avgPoints: number;
	avgBasePoints: number;
	sessionCount: number;
};
