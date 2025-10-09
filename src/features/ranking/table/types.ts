import { TrackStatsType, TrackHistoryType } from "@/types/track";

export type RankingListDataTypeExtend = TrackHistoryType | TrackStatsType;

export type AdvancedFilters = {
	search?: string;
	albums?: string[];
};

export type RankingTableProps<T extends RankingListDataTypeExtend> = {
	data: T[];
	columnKey: (keyof T)[];
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
