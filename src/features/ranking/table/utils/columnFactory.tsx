import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import TrackCell from "../components/TrackCell";
import type { RankingListDataTypeExtend } from "../types";
import { Badge } from "@/components/ui/badge";

export type ColumnType =
	| "rank"
	| "track"
	| "number"
	| "rankNumber"
	| "decimal"
	| "change"
	| "achievement"
	| "streak"
	| "changePercent";

export type ColumnConfig = {
	key: string;
	header: string;
	type: ColumnType;
	size?: number;
	className?: string;
	sortable?: boolean;
	sortDescFirst?: boolean;
};

const NUMBER_SIZE = 140;

// 欄位配置定義
export const COLUMN_CONFIGS: Record<string, ColumnConfig> = {
	rank: { key: "rank", header: "#", type: "rank", size: 45, sortable: false },
	name: { key: "name", header: "Track", type: "track", sortDescFirst: false },
	rankChange: { key: "rankChange", header: "", type: "change", size: 45 },
	overallRankChange: {
		key: "overallRankChange",
		header: "Change",
		type: "change",
		size: NUMBER_SIZE,
	},
	peak: {
		key: "peak",
		header: "Peak",
		type: "rankNumber",
		size: NUMBER_SIZE,
		sortDescFirst: false,
	},
	highestRank: {
		key: "highestRank",
		header: "Peak",
		type: "rankNumber",
		size: NUMBER_SIZE,
		sortDescFirst: false,
	},
	hotStreak: {
		key: "hotStreak",
		header: "Hot Streak",
		type: "number",
		size: NUMBER_SIZE,
		sortDescFirst: true,
	},
	coldStreak: {
		key: "coldStreak",
		header: "Cold Streak",
		type: "number",
		size: NUMBER_SIZE,
		sortDescFirst: true,
	},
	averageRank: {
		key: "averageRank",
		header: "Avg.",
		type: "decimal",
		size: NUMBER_SIZE,
		sortDescFirst: false,
	},
	top50PercentCount: {
		key: "top50PercentCount",
		header: "Top 50%",
		type: "number",
		size: NUMBER_SIZE,
		sortDescFirst: true,
	},
	top25PercentCount: {
		key: "top25PercentCount",
		header: "Top 25%",
		type: "number",
		size: NUMBER_SIZE,
		sortDescFirst: true,
	},
	top5PercentCount: {
		key: "top5PercentCount",
		header: "Top 5%",
		type: "number",
		size: NUMBER_SIZE,
		sortDescFirst: true,
	},
	achievement: {
		key: "achievement",
		header: "Achievement",
		type: "achievement",
		size: NUMBER_SIZE,
		sortDescFirst: true,
	},
	streak: {
		key: "streak",
		header: "Streak",
		type: "streak",
		size: NUMBER_SIZE,
		sortDescFirst: true,
	},
	significantChange: {
		key: "significantChange",
		header: "",
		type: "changePercent",
		size: NUMBER_SIZE,
		sortDescFirst: true,
	},
};

// 欄位工廠函數
export const createRankingColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	accessorKey: config.key,
	header: () => config.header,
	cell: ({ getValue }) => (
		<div className="font-numeric text-lg">{getValue() as number}</div>
	),
	size: config.size,
	enableSorting: config.sortable ?? true,
	sortDescFirst: config.sortDescFirst ?? false,
});

export const createTrackColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	accessorKey: config.key,
	header: config.header,
	enableSorting: config.sortable ?? true,
	sortDescFirst: config.sortDescFirst ?? false,
	cell: ({ row }) => <TrackCell item={row.original} />,
});

export const createNumberColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	accessorKey: config.key,
	header: () => <div className="text-right">{config.header}</div>,
	cell: ({ getValue }) => (
		<div className="font-numeric text-right">{getValue() as number}</div>
	),
	size: config.size,
	enableSorting: config.sortable ?? true,
	sortDescFirst: config.sortDescFirst ?? false,
});

export const createRankNumberColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	accessorKey: config.key,
	header: () => <div className="text-right">{config.header}</div>,
	cell: ({ getValue }) => (
		<div className="font-numeric text-right">#{getValue() as number}</div>
	),
	size: config.size,
	enableSorting: config.sortable ?? true,
	sortDescFirst: config.sortDescFirst ?? false,
});

export const createChangeColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	accessorKey: config.key,
	header: () => <div className="text-right">{config.header}</div>,
	enableSorting: config.sortable ?? true,
	sortDescFirst: config.sortDescFirst ?? false,
	cell: ({ getValue }) => {
		const change = getValue() as number;
		if (change === undefined || change === 0)
			return (
				<div className="text-right text-xl text-secondary-foreground">-</div>
			);
		if (change === null)
			return <div className="text-right text-xl text-blue-500">●</div>;

		return (
			<div
				className={cn("flex items-center justify-end gap-1", {
					"text-green-500": change > 0,
					"text-red-500": change < 0,
				})}
			>
				{change > 0 ? (
					<ArrowUp className="h-3 w-3" />
				) : (
					<ArrowDown className="h-3 w-3" />
				)}
				<span className="font-numeric text-sm">{Math.abs(change)}</span>
			</div>
		);
	},
	size: config.size,
});

export const createAchievementColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	accessorKey: config.key,
	header: () => <div className="text-right">{config.header}</div>,
	enableSorting: config.sortable ?? true,
	sortDescFirst: config.sortDescFirst ?? false,
	cell: ({ getValue }) => {
		const achievemts = getValue() as string[];
		return (
			<div className="flex items-center justify-end gap-1">
				{achievemts.map((achievemt) => (
					<Badge
						key={achievemt}
						variant={"outline"}
						className="border-primary font-numeric text-primary"
						size={"lg"}
					>
						{achievemt}
					</Badge>
				))}
			</div>
		);
	},
	size: config.size,
});

export const createDecimalColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	accessorKey: config.key,
	header: () => <div className="text-right">{config.header}</div>,
	cell: ({ getValue }) => (
		<div className="font-numeric text-right">
			{(getValue() as number).toFixed(2)}
		</div>
	),
	size: config.size,
	enableSorting: config.sortable ?? true,
	sortDescFirst: config.sortDescFirst ?? false,
});

export const createStreakColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	id: config.key,
	accessorFn: (row) =>
		"hotStreak" in row ? row.hotStreak - row.coldStreak : 0,
	header: () => <div className="text-right">{config.header}</div>,
	enableSorting: config.sortable ?? true,
	sortDescFirst: config.sortDescFirst ?? false,
	cell: ({ row }) => {
		const item = row.original;
		if (!("hotStreak" in item))
			return <div className="text-right text-secondary-foreground">-</div>;

		const { hotStreak, coldStreak } = item;

		if (hotStreak >= 3) {
			return (
				<div className="flex items-center justify-end gap-1.5">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
						<Plus className="h-3 w-3" />
					</span>
					<span className="font-numeric text-primary">X{hotStreak}</span>
				</div>
			);
		}

		if (coldStreak >= 3) {
			return (
				<div className="flex items-center justify-end gap-1.5">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/15 text-destructive">
						<Minus className="h-3 w-3" />
					</span>
					<span className="font-numeric text-destructive">X{coldStreak}</span>
				</div>
			);
		}

		return <div className="text-right text-secondary-foreground">-</div>;
	},
	size: config.size,
});

const SIGNIFICANT_CHANGE_THRESHOLD = 0.2;

export const createChangePercentColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	id: config.key,
	accessorFn: (row) =>
		"totalCount" in row && row.rankChange
			? Math.abs(row.rankChange) / row.totalCount
			: 0,
	header: () => <div className="text-right">{config.header}</div>,
	enableSorting: config.sortable ?? true,
	sortDescFirst: config.sortDescFirst ?? false,
	cell: ({ row }) => {
		const item = row.original;
		if (!("totalCount" in item) || !item.rankChange)
			return null;

		const changeRatio = Math.abs(item.rankChange) / item.totalCount;
		if (changeRatio < SIGNIFICANT_CHANGE_THRESHOLD) return null;

		return (
			<div className="flex justify-end">
				<Badge
					variant="outline"
					size="lg"
					className={cn(
						"font-numeric",
						item.rankChange > 0
							? "border-primary text-primary"
							: "border-destructive text-destructive"
					)}
				>
					{item.rankChange > 0 ? "Surge" : "Slump"}
				</Badge>
			</div>
		);
	},
	size: config.size,
});

// 主要工廠函數
export const createColumn = (
	configKey: keyof typeof COLUMN_CONFIGS
): ColumnDef<RankingListDataTypeExtend> => {
	const config = COLUMN_CONFIGS[configKey];

	switch (config.type) {
		case "rank":
			return createRankingColumn(config);
		case "track":
			return createTrackColumn(config);
		case "number":
			return createNumberColumn(config);
		case "rankNumber":
			return createRankNumberColumn(config);
		case "decimal":
			return createDecimalColumn(config);
		case "change":
			return createChangeColumn(config);
		case "achievement":
			return createAchievementColumn(config);
		case "streak":
			return createStreakColumn(config);
		case "changePercent":
			return createChangePercentColumn(config);
		default:
			throw new Error(`Unknown column type: ${config.type}`);
	}
};

// 批次創建欄位
export const createColumns = (
	columnKeys: (keyof typeof COLUMN_CONFIGS)[]
): ColumnDef<RankingListDataTypeExtend>[] => {
	return columnKeys.map(createColumn);
};

// 獲取可用的欄位鍵
export const getAvailableColumnKeys = () =>
	Object.keys(COLUMN_CONFIGS) as (keyof typeof COLUMN_CONFIGS)[];
