import { $Enums } from "@prisma/client";
import { RankingSettingsType } from "./schemas/settings";
import { RankingResultData } from "@/components/sorter/SorterField";

export type AlbumData = {
	name: string;
    type: $Enums.AlbumType;
    id: string;
    color: string | null;
    img: string | null;
    artistId: string;
    spotifyUrl: string;
    releaseDate: Date;
    tracks?: TrackData[]
};

export type ArtistData = {
	id: string;
	name: string;
	spotifyUrl: string;
	img: string | null;
	spotifyFollowers: number;
};

export type TrackData = {
	id: string;
    name: string;
    albumId: string | null;
    trackNumber: number | null;
    spotifyUrl: string;
    img: string | null;
    artistId: string;
    releaseDate: Date | null
	artist?: ArtistData;
    album?: AlbumData | null
    type: $Enums.TrackType;
}

export type RankingData = {
    ranking: number;
    id: string;
    dateId: string;
    trackId: string;
    albumId: string | null;
    artistId: string;
    userId: string;
    rankChange: number | null;
    artist?: ArtistData;
    album?: AlbumData | null;
    user?: UserData;
}

export type UserData = {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
    password: string | null;
    emailVerified: Date | null;
    image: string | null;
    role: $Enums.Role;
    createdAt: Date;
    updatedAt: Date;
}

export type RankingSessionData = {
    artistId: string | null;
    userId: string;
    id: string;
    date: Date;
    type: $Enums.RankingType | null;
    artist?: ArtistData;
    user?: UserData;
}

export type RankingDraftData = {
    id: string;
    result: RankingResultData[] | null;
    date: Date;
    userId: string;
    artistId: string;
    draft: string | null;
    type: $Enums.RankingType | null;
}

export type UserPreferenceData = {
    id: string;
    userId: string;
    rankingSettings: RankingSettingsType;
}