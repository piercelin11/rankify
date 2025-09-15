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