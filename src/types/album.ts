import { AlbumData } from "@/types/data";

export type AlbumStatsType = Omit<AlbumData, "tracks"> & {
	rank: number;
	averageRank: number | string;
	top5PercentCount: number;
	top10PercentCount: number;
	top25PercentCount: number;
	top50PercentCount: number;
	avgPoints: number;
	avgBasePoints: number;
	submissionCount: number;
};

export type AlbumHistoryType = Omit<AlbumData, "tracks"> & {
	submissionId: string;
	createdAt: Date;
	rank: number;
	top25PercentCount: number;
	top50PercentCount: number;
	totalPoints: number;
	totalBasePoints: number;
	previousTotalPoints?: number;
	pointsChange?: number | null;
};
