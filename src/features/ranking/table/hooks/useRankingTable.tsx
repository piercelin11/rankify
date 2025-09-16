import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";
import {
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { RankingListDataTypeExtend, RankingTableFeatures } from "../types";

export function useRankingTable<T extends RankingListDataTypeExtend>({
	data,
	columnKey = [],
	columns,
	features = {},
}: {
	data: T[];
	columnKey?: (keyof T)[];
	columns?: ColumnDef<T>[];
	features?: RankingTableFeatures;
}) {
	const [globalFilter, setGlobalFilter] = useState("");

	// 預設欄位定義
	const defaultColumns: ColumnDef<T>[] = [
		{
			accessorKey: "ranking",
			header: () => "#",
			size: 20,
		},
		{
			accessorKey: "name",
			header: "Track",
			cell: ({ row }) => (
				<div className="flex items-center gap-3">
					{row.original.img && (
						<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
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
						<p className="truncate font-medium">{row.original.name}</p>
						{row.original.album?.name && (
							<p className="truncate text-sm text-muted-foreground">
								{row.original.album.name}
							</p>
						)}
					</div>
				</div>
			),
		},
		{
			accessorKey: "rankChange",
			header: () => <div className="text-right">Change</div>,
			cell: ({ getValue }) => {
				const change = getValue() as number;
				if (change === undefined || change === 0)
					return <div className="text-right">-</div>;

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
			size: 140,
		},
		{
			accessorKey: "peak",
			header: () => <div className="text-right">Peak</div>,
			cell: ({ getValue }) => (
				<div className="font-mono text-right">{getValue() as number}</div>
			),
			size: 140,
		},
		{
			accessorKey: "worst",
			header: () => <div className="text-right">Worst</div>,
			cell: ({ getValue }) => (
				<div className="font-mono text-right">{getValue() as number}</div>
			),
			size: 140,
		},
		{
			accessorKey: "averageRanking",
			header: () => <div className="text-right">Avg.</div>,
			cell: ({ getValue }) => (
				<div className="font-mono text-right">{getValue() as number}</div>
			),
			size: 140,
		},
		{
			accessorKey: "top50PercentCount",
			header: () => <div className="text-right">Top 50%</div>,
			cell: ({ getValue }) => (
				<div className="font-mono text-right">{getValue() as number}</div>
			),
			size: 140,
		},
		{
			accessorKey: "top25PercentCount",
			header: () => <div className="text-right">Top 25%</div>,
			cell: ({ getValue }) => (
				<div className="font-mono text-right">{getValue() as number}</div>
			),
			size: 140,
		},
		{
			accessorKey: "top5PercentCount",
			header: () => <div className="text-right">Top 5%</div>,
			cell: ({ getValue }) => (
				<div className="font-mono text-right">{getValue() as number}</div>
			),
			size: 140,
		},
	];

	// 使用自定義欄位或預設欄位
	const tableColumns =
		columns ||
		defaultColumns.filter((column) => {
			if (!("accessorKey" in column)) return 1;
			if (column.accessorKey === "ranking" || column.accessorKey === "name") {
				return 1;
			}
			return columnKey.includes(column.accessorKey as keyof T);
		});

	// React Table 設定
	const table = useReactTable({
		data,
		columns: tableColumns,
		state: {
			globalFilter,
		},
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: features.sort ? getSortedRowModel() : undefined,
		getFilteredRowModel: features.search ? getFilteredRowModel() : undefined,
		getPaginationRowModel: features.pagination
			? getPaginationRowModel()
			: undefined,
		initialState: {
			pagination: {
				pageSize:
					typeof features.pagination === "object"
						? features.pagination.pageSize || 10
						: 10,
			},
		},
	});

	return {
		table,
		tableColumns,
		globalFilter,
		setGlobalFilter,
	};
}