export type ItunesSongResult = {
	trackId: number;
	trackName: string;
	artistName: string;
	collectionId: number;
	collectionName: string;
	previewUrl: string | null;
};

export type ItunesSearchResponse = {
	resultCount: number;
	results: ItunesSongResult[];
};

export type ItunesLookupResponse = {
	resultCount: number;
	results: ItunesSongResult[];
};
