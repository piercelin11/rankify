import { $Enums } from "@prisma/client";

export type AlbumData = {
	name: string;
    type: $Enums.AlbumType;
    id: string;
    color: string | null;
    img: string | null;
    artistId: string;
    spotifyUrl: string;
    releaseDate: Date;
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
	artist?: {
        id: string;
        name: string;
        spotifyUrl: string;
        img: string | null;
        spotifyFollowers: number;
    };
    album?: {
        id: string;
        name: string;
        spotifyUrl: string;
        img: string | null;
        artistId: string;
        releaseDate: Date;
        color: string | null;
        type: $Enums.AlbumType;
    } | null
}
