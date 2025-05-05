import {
	Album,
	Artist,
	Ranking,
	RankingDraft,
	RankingSession,
	Track,
	User,
} from "@prisma/client";
import { RankingSettingsType } from "./schemas/settings";
import { RankingResultData } from "@/features/sorter/components/SortingStage";

export type AlbumData = Album & {
	tracks?: TrackData[];
	artist?: ArtistData;
};

export type ArtistData = Artist;

export type TrackData = Track & {
	artist?: ArtistData;
	album?: AlbumData | null;
};

export type RankingData = Ranking & {
	artist?: ArtistData;
	album?: AlbumData | null;
	user?: UserData;
};

export type UserData = User;

export type RankingSessionData = RankingSession & {
	artist?: ArtistData;
	user?: UserData;
};

export type RankingDraftData = RankingDraft & {
	draft: RankingResultData | null;
};

export type UserPreferenceData = {
	id: string;
	userId: string;
	rankingSettings: RankingSettingsType;
};
