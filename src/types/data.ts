export type AlbumData = {
	artistId: string;
	id: string;
	name: string;
	spotifyUrl: string;
	img: string | null;
	releaseDate: Date;
};

export type ArtistData = {
	id: string;
	name: string;
	spotifyUrl: string;
	img: string | null;
	spotifyFollowers: number;
};
