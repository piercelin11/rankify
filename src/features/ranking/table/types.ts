import { TrackStatsType, TrackHistoryType } from "@/types/track";
import type { COLUMN_CONFIGS } from "./utils/columnFactory";

export type RankingListDataTypeExtend = TrackHistoryType | TrackStatsType;

export type AdvancedFilters = {
	search?: string;
	albums?: string[];
};

export type RankingTableProps<T extends RankingListDataTypeExtend> = {
	artistId: string;
	data: T[];
	columnKey: (keyof T | keyof typeof COLUMN_CONFIGS)[];
	currentSubmissionId?: string;
	submissions: {
		id: string;
		date: Date;
	}[];
	isLoading?: boolean;
	className?: string;
	availableAlbums?: string[];
	view: "average" | "snapshot";
};
