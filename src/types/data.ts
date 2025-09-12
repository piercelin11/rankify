import {
	Album,
	Artist,
	Ranking,
	RankingDraft,
	RankingSession,
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

export type RankingData = Ranking & {
	artist?: ArtistData;
	album?: AlbumData | null;
	user?: UserData;
};

export type UserData = {
	id: string;
	name: string;
	username: string | null;
	image: string | null;
};

export type RankingSessionData = RankingSession & {
	artist?: ArtistData;
	user?: UserData;
};

export type RankingDraftData = RankingDraft;

export type UserPreferenceData = {
	id: string;
	userId: string;
	rankingSettings: RankingSettingsType;
};
