import { TrackData } from "@/types/data";

export type TrackMetrics = {
    id: string;
    ranking: number;
    peak: number;
    worst: number;
    count: number;
    averageRanking: number;
};

export type TrackStatsType = Omit<TrackData, "artist" | "album"> & {
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
};