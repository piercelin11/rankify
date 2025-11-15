import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import TrackCell from "../components/TrackCell";
import type { RankingListDataTypeExtend } from "../types";
import { Badge } from "@/components/ui/badge";

export type ColumnType = "rank" | "track" | "number" | "change" | "achievement";

export type ColumnConfig = {
	key: string;
	header: string;
	type: ColumnType;
	size?: number;
	className?: string;
};

const NUMBER_SIZE = 140;

// 欄位配置定義
export const COLUMN_CONFIGS: Record<string, ColumnConfig> = {
	rank: { key: "rank", header: "", type: "rank", size: 45 },
	name: { key: "name", header: "Track", type: "track" },
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
		type: "number",
		size: NUMBER_SIZE,
	},
	hotStreak: {
		key: "hotStreak",
		header: "Hot Streak",
		type: "number",
		size: NUMBER_SIZE,
	},
	coldStreak: {
		key: "coldStreak",
		header: "Cold Streak",
		type: "number",
		size: NUMBER_SIZE,
	},
	averageRank: {
		key: "averageRank",
		header: "Avg.",
		type: "number",
		size: NUMBER_SIZE,
	},
	top50PercentCount: {
		key: "top50PercentCount",
		header: "Top 50%",
		type: "number",
		size: NUMBER_SIZE,
	},
	top25PercentCount: {
		key: "top25PercentCount",
		header: "Top 25%",
		type: "number",
		size: NUMBER_SIZE,
	},
	top5PercentCount: {
		key: "top5PercentCount",
		header: "Top 5%",
		type: "number",
		size: NUMBER_SIZE,
	},
	achievement: {
		key: "achievement",
		header: "Achievement",
		type: "achievement",
		size: NUMBER_SIZE,
	},
};

// 欄位工廠函數
export const createRankingColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	accessorKey: config.key,
	header: () => config.header,
	size: config.size,
});

export const createTrackColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	accessorKey: config.key,
	header: config.header,
	cell: ({ row }) => <TrackCell item={row.original} />,
});

export const createNumberColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	accessorKey: config.key,
	header: () => <div className="text-right">{config.header}</div>,
	cell: ({ getValue }) => (
		<div className="font-mono text-right">{getValue() as number}</div>
	),
	size: config.size,
});

export const createChangeColumn = (
	config: ColumnConfig
): ColumnDef<RankingListDataTypeExtend> => ({
	accessorKey: config.key,
	header: () => <div className="text-right">{config.header}</div>,
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
				<span className="font-mono text-sm">{Math.abs(change)}</span>
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
	cell: ({ getValue }) => {
		const achievemts = getValue() as string[];
		return (
			<div className="flex items-center justify-end gap-1">
				{achievemts.map((achievemt) => (
					<Badge
						key={achievemt}
						variant={"outline"}
						className="border-primary text-primary"
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
		case "change":
			return createChangeColumn(config);
		case "achievement":
			return createAchievementColumn(config);
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
