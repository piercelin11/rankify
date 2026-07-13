export type AlbumRankingItem = {
	albumId: string;
	name: string;
	img: string | null;
	color: string | null;
	score: number;
	peak: number;
	rank: number;
	rankChange?: number | null;
	percentChange?: number | null;
};
