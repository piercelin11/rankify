import type { ColumnDef } from "@tanstack/react-table";
import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { TrackStatsType } from "@/services/track/getTracksStats";

export type RankingListDataTypeExtend = TrackHistoryType | TrackStatsType;

export type RankingTableFeatures = {
	sort?: boolean;
	search?: boolean | {
		placeholder?: string;
		fields?: string[];
	};
	filter?: boolean | {
		fields?: string[];
	};
	pagination?: boolean | {
		pageSize?: number;
		showPageSizeSelector?: boolean;
	};
	header?: boolean;
};

export type RankingTableAppearance = {
	variant?: 'default' | 'compact' | 'detailed';
	showImages?: boolean;
	showRankChange?: boolean;
	density?: 'comfortable' | 'compact' | 'spacious';
};

export type RankingTableProps<T> = {
	data: T[];
	columnKey?: (keyof T)[];
	columns?: ColumnDef<T>[];
	features?: RankingTableFeatures;
	appearance?: RankingTableAppearance;
	className?: string;
};