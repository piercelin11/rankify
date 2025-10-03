import { TrackHistoryType, TrackStatsType } from "@/types/track";

export type RankingListDataTypeExtend = TrackHistoryType | TrackStatsType;

export type RankingTableFeatures = {
	sort?: boolean;
	search?: boolean;
	header?: boolean;
	pagination?: boolean | {
		pageSize?: number;
		showPageSizeSelector?: boolean;
	};
};

export type RankingTableAppearance = {
	showImages?: boolean;
};

// Advanced table types (merged from advanced/types.ts)
export type AdvancedTableFeatures = RankingTableFeatures & {
	virtualization?: boolean;
	columnSelector?: boolean;
	advancedFilter?: boolean;
	timeRangeSelector?: boolean
};

export type ColumnVisibility = {
	ranking: boolean;
	name: boolean;
	rankChange: boolean;
	peak: boolean;
	worst: boolean;
	averageRanking: boolean;
	top50PercentCount: boolean;
	top25PercentCount: boolean;
	top5PercentCount: boolean;
};

export type AdvancedFilters = {
	search?: string;
	albums?: string[];
};

export type RankingTableProps<T extends RankingListDataTypeExtend> = {
	data: T[];
	columnKey: (keyof T)[];
	isLoading?: boolean;
	features?: AdvancedTableFeatures;
	className?: string;
	availableAlbums?: string[];
	onRowClick?: (item: T) => void;
};

