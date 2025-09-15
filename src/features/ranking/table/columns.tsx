import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { RankingItem } from "./types";

// 預設欄位定義生成器
export function createRankingColumns(options?: {
	showImages?: boolean;
	showRankChange?: boolean;
	customColumns?: Partial<Record<string, ColumnDef<RankingItem>>>;
}): ColumnDef<RankingItem>[] {
	const { showImages = true, showRankChange = true, customColumns = {} } = options || {};

	const baseColumns: ColumnDef<RankingItem>[] = [
		{
			accessorKey: "ranking",
			header: "#",
			size: 60,
			...customColumns.ranking,
		},
		{
			accessorKey: "name",
			header: "歌曲",
			cell: ({ row }) => (
				<div className="flex items-center gap-3">
					{showImages && row.original.img && (
						<div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
							<Image
								src={row.original.img}
								alt={row.original.name}
								fill
								sizes="48px"
								className="object-cover"
							/>
						</div>
					)}
					<div className="min-w-0 flex-1">
						<p className="font-medium truncate">{row.original.name}</p>
						{row.original.album?.name && (
							<p className="text-sm text-muted-foreground truncate">
								{row.original.album.name}
							</p>
						)}
					</div>
				</div>
			),
			...customColumns.name,
		},
	];

	// 條件性添加欄位
	if (showRankChange) {
		baseColumns.push({
			accessorKey: "rankChange",
			header: "變化",
			cell: ({ getValue }) => {
				const change = getValue() as number;
				if (change === undefined || change === 0) return "-";

				return (
					<div className={cn("flex items-center gap-1", {
						"text-green-500": change > 0,
						"text-red-500": change < 0,
					})}>
						{change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
						<span className="font-mono text-sm">{Math.abs(change)}</span>
					</div>
				);
			},
			...customColumns.rankChange,
		});
	}

	// 其他常用欄位
	const optionalColumns: ColumnDef<RankingItem>[] = [
		{
			accessorKey: "points",
			header: "積分",
			cell: ({ getValue }) => {
				const points = getValue() as number;
				return points ? <span className="font-mono">{points}</span> : "-";
			},
			...customColumns.points,
		},
		{
			accessorKey: "weeks",
			header: "週數",
			cell: ({ getValue }) => {
				const weeks = getValue() as number;
				return weeks ? <span className="font-mono">{weeks}</span> : "-";
			},
			...customColumns.weeks,
		},
	];

	return [...baseColumns, ...optionalColumns];
}

// 個別欄位定義（可單獨使用）
export const rankingColumn: ColumnDef<RankingItem> = {
	accessorKey: "ranking",
	header: "#",
	size: 60,
};

export const nameColumn: ColumnDef<RankingItem> = {
	accessorKey: "name",
	header: "歌曲",
	cell: ({ row }) => (
		<div className="flex items-center gap-3">
			{row.original.img && (
				<div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
					<Image
						src={row.original.img}
						alt={row.original.name}
						fill
						sizes="48px"
						className="object-cover"
					/>
				</div>
			)}
			<div className="min-w-0 flex-1">
				<p className="font-medium truncate">{row.original.name}</p>
				{row.original.album?.name && (
					<p className="text-sm text-muted-foreground truncate">
						{row.original.album.name}
					</p>
				)}
			</div>
		</div>
	),
};

export const pointsColumn: ColumnDef<RankingItem> = {
	accessorKey: "points",
	header: "積分",
	cell: ({ getValue }) => {
		const points = getValue() as number;
		return points ? <span className="font-mono">{points}</span> : "-";
	},
};

export const rankChangeColumn: ColumnDef<RankingItem> = {
	accessorKey: "rankChange",
	header: "變化",
	cell: ({ getValue }) => {
		const change = getValue() as number;
		if (change === undefined || change === 0) return "-";

		return (
			<div className={cn("flex items-center gap-1", {
				"text-green-500": change > 0,
				"text-red-500": change < 0,
			})}>
				{change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
				<span className="font-mono text-sm">{Math.abs(change)}</span>
			</div>
		);
	},
};

export const weeksColumn: ColumnDef<RankingItem> = {
	accessorKey: "weeks",
	header: "週數",
	cell: ({ getValue }) => {
		const weeks = getValue() as number;
		return weeks ? <span className="font-mono">{weeks}</span> : "-";
	},
};