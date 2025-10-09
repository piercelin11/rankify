// 共享的圖表相關類型定義

export type ChartOptionBase = {
	id: string;
	name: string;
	color: string | null;
};

export type ParentOptionType = ChartOptionBase;

export type MenuOptionType = ChartOptionBase & {
	parentId?: string | null;
};

export type FilterTag = ChartOptionBase;

export type DynamicTrackData = {
	type: 'track';
	id: string;
	name: string;
	color: string | null;
	rankings?: Array<{
		rank: number;
		rankPercentile: number;
		rankChange: number | null;
		date: Date;
		dateId: string;
	}>;
};

export type DynamicAlbumData = {
	type: 'album';
	id: string;
	name: string;
	color: string | null;
	rankings?: Array<{
		rank: number;
		points: number;
		date: Date;
		dateId: string;
	}>;
};

export type ComparisonData = DynamicTrackData | DynamicAlbumData;

// 統一的圖表配置類型
export type LineChartConfig = {
	dataKey: string;
	isReverse: boolean;
	hasToggle?: boolean;
	toggleOptions?: Array<{
		label: string;
		value: string;
		dataKey: string;
		isReverse: boolean;
	}>;
};

// 統一的排名資料類型
export type UnifiedRankingData = {
	id: string;
	name: string;
	color: string | null;
	album?: {
		name: string | null;
		color: string | null;
	} | null;
	rankings?: Array<{
		date: Date;
		dateId: string;
		[key: string]: unknown;
	}>;
};

// Hook 返回類型
export type LineChartFilterState = {
	isOpen: boolean;
	setOpen: (open: boolean) => void;
	comparisonQuery: string[];
	comparisonData: ComparisonData[];
	loadingIds: Set<string>;
	isPending: boolean;
	filteredParentId: string | null;
	handleAlbumFilter: (parentId: string) => void;
	handleMenuItemClick: (menuId: string) => void;
	handleTagDelete: (menuId: string) => void;
	handleClearAll: () => void;
};