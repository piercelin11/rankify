import { Artist, Album, RankingSubmission } from "@prisma/client";
import { SorterStateType } from "@/lib/schemas/sorter";

// ========== Dashboard ==========
export type DashboardStatsType = {
	rankingCount: number;
	songCount: number;
	topArtist: {
		id: string;
		name: string;
		img: string | null;
	} | null;
};

// ========== Drafts ==========
export type DraftItemType = RankingSubmission & {
	artist: Pick<Artist, "id" | "name" | "img">;
	album: Pick<Album, "id" | "name" | "img"> | null;
	draftState: SorterStateType;
};

// ========== History ==========
export type HistoryItemType = Pick<
	RankingSubmission,
	"id" | "type" | "completedAt" | "artistId" | "albumId"
> & {
	artist: Pick<Artist, "id" | "name" | "img">;
	album: Pick<Album, "id" | "name" | "img"> | null;
};

// ========== Trending ==========
export type TrendingArtistType = {
	id: string;
	name: string;
	img: string | null;
};

// ========== Search ==========
export type SearchResultType = {
	artists: Array<{
		id: string;
		name: string;
		img: string | null;
		type: "artist";
	}>;
	albums: Array<{
		id: string;
		name: string;
		img: string | null;
		artistId: string;
		artistName: string;
		type: "album";
	}>;
};
