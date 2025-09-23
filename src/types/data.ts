import {
	Album,
	Artist,
	RankingSubmission,
	TrackRanking,
	Track,
} from "@prisma/client";
import { RankingSettingsType } from "./schemas/settings";

export type AlbumData = Album & {
	tracks?: TrackData[];
	artist?: ArtistData;
};

export type ArtistData = Artist;

export type TrackData = Track & {
	artist?: ArtistData;
	album?: AlbumData | null;
};

// 這些舊類型已移除，請使用新的類型定義

// 新的類型定義
export type RankingSubmissionData = RankingSubmission & {
	artist?: ArtistData;
	user?: UserData;
	album?: AlbumData | null;
	trackRanks?: TrackRankingData[];
	albumRanks?: AlbumRankingData[];
};

export type TrackRankingData = TrackRanking & {
	track?: TrackData;
	submission?: RankingSubmissionData;
};

export type AlbumRankingData = {
	id: string;
	ranking: number;
	points: number;
	basePoints: number;
	averageTrackRanking: number;
	albumId: string;
	artistId: string;
	userId: string;
	album?: AlbumData;
	artist?: ArtistData;
	user?: UserData;
	submission?: RankingSubmissionData;
};

export type UserData = {
	id: string;
	name: string;
	username: string | null;
	image: string | null;
};

export type UserPreferenceData = {
	id: string;
	userId: string;
	rankingSettings: RankingSettingsType;
};
