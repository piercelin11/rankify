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

// ========== Hero ==========
export type HeroItemType = {
	type: "achievement" | "resume" | "top_artist" | "discovery";
	data: {
		id: string;
		name: string;
		img: string | null;
		submissionId?: string;
		completedAt?: Date;
		progress?: number;
		artistId?: string;
		type?: "ARTIST" | "ALBUM"; // Resume/Achievement 專用 (用於判斷路由)
	};
};

// ========== Discovery ==========
export type DiscoveryType = {
	id: string;
	name: string;
	img: string | null;
};

// ========== Trending (保留向後相容) ==========
export type TrendingArtistType = DiscoveryType;

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
