import type { AlbumStatsType } from "@/types/album";

export type PercentileKey = "top5" | "top10" | "top25" | "top50";

export type PercentileOption = {
	value: PercentileKey;
	label: string;
	field: keyof Pick<
		AlbumStatsType,
		| "top5PercentCount"
		| "top10PercentCount"
		| "top25PercentCount"
		| "top50PercentCount"
	>;
};

export const PERCENTILE_OPTIONS: PercentileOption[] = [
	{ value: "top5", label: "Top 5%", field: "top5PercentCount" },
	{ value: "top10", label: "Top 10%", field: "top10PercentCount" },
	{ value: "top25", label: "Top 25%", field: "top25PercentCount" },
	{ value: "top50", label: "Top 50%", field: "top50PercentCount" },
];
