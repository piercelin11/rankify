import type { ColumnDef } from "@tanstack/react-table";
import type {
	RankingListDataTypeExtend,
	RankingTableFeatures,
	RankingTableAppearance
} from "../types";

export type AdvancedTableFeatures = RankingTableFeatures & {
	virtualization?: boolean;
	columnSelector?: boolean;
	advancedFilter?: boolean;
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

export type FilterConfig = {
	type: "text" | "number" | "select" | "range";
	label: string;
	field: string;
	options?: { label: string; value: string | number }[];
	min?: number;
	max?: number;
};

export type AdvancedFilters = {
	search?: string;
	albums?: string[]; // 選中的專輯名稱陣列
};

export type AdvancedRankingTableProps<T extends RankingListDataTypeExtend> = {
	data: T[];
	columnKey: (keyof T)[];
	isLoading?: boolean;
	features?: AdvancedTableFeatures;
	appearance?: RankingTableAppearance;
	className?: string;
	onFiltersChange?: (filters: AdvancedFilters) => void;
	onColumnsChange?: (columns: ColumnVisibility) => void;
	availableAlbums?: string[];
};

export type VirtualizedTableProps<T> = {
	data: T[];
	columns: ColumnDef<T>[];
	height: number;
	estimateSize?: () => number;
	overscan?: number;
	isLoading?: boolean;
};