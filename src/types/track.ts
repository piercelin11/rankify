import { TrackData } from "@/types/data";
import { AchievementType } from "@/features/ranking/stats/components/AchievementDisplay";
import { TrackStat } from "@prisma/client";

export type TrackMetrics = {
	id: string;
	ranking: number;
	peak: number;
	worst: number;
	count: number;
	averageRanking: number;
};

/* export type TrackStatsType = Omit<TrackData, "artist" | "album"> & {
	ranking: number;
	averageRanking: number | string;
	peak: number;
	worst: number;
	gap: number | null;
	album: {
		name: string | null;
		color: string | null;
	};
	top50PercentCount: number;
	top25PercentCount: number;
	top5PercentCount: number;
	sessionCount: number;
}; */

export type TrackStatsType = TrackStat & Omit<TrackData, "artist" | "album"> & {
	rank: number;
	gap: number | null;
	album: {
		name: string | null;
		color: string | null;
	};
	top50PercentCount: number;
	top25PercentCount: number;
	top5PercentCount: number;
};


export type TrackHistoryType = Omit<TrackData, "artist" | "album"> & {
	date: Date;
	submissionId: string;
	createdAt: Date;
	album: {
		name: string;
		color: string | null;
	} | null;
	rank: number;
	peak: number;
	rankChange: number | null;
	rankPercentile: number;
	achievement: AchievementType[];
};
