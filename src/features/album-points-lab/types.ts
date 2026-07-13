export type AlbumPointsParams = {
	curveExponent: number;
	penaltyTolerance: number;
	penaltyScale: number;
	penaltySteepness: number;
	trimPercentile: number;
};

export type LabTrackStat = {
	trackId: string;
	trackName: string;
	albumId: string | null;
	overallRank: number;
};

export type LabAlbum = {
	id: string;
	name: string;
	color: string | null;
	img: string | null;
	releaseDate: Date;
};

export type LabArtistData = {
	artistId: string;
	artistName: string;
	tracks: LabTrackStat[];
	albums: LabAlbum[];
};

export type AlbumScoreResult = {
	albumId: string;
	score: number;
	averageTrackRanking: number;
};
