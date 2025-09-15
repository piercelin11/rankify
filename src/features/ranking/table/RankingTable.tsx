"use client";

import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";
import {
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RankingTableFeatures, RankingTableAppearance } from "./types";
import { TrackHistoryType } from "@/lib/database/ranking/history/getTracksRankingHistory";
import { TrackStatsType } from "@/lib/database/ranking/overview/getTracksStats";

type RankingListDataTypeExtend = TrackHistoryType | TrackStatsType;

type RankingTableProps<T> = {
	data: T[];
	columnKey?: (keyof T)[];
	columns?: ColumnDef<T>[];
	features?: RankingTableFeatures;
	appearance?: RankingTableAppearance;
	className?: string;
};

export default function RankingTable<T extends RankingListDataTypeExtend>({
	data,
	columnKey = [],
	columns,
	features = {},
	appearance = {},
	className,
}: RankingTableProps<T>) {
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
					{appearance.showImages !== false && row.original.img && (
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

	return (
		<div className={cn("space-y-4", className)}>
			{/* 搜尋功能 */}
			{features.search && (
				<div className="flex items-center space-x-2">
					<Input
						placeholder={
							typeof features.search === "object" && features.search.placeholder
								? features.search.placeholder
								: "Search tracks..."
						}
						value={globalFilter ?? ""}
						onChange={(event) => setGlobalFilter(String(event.target.value))}
						className="max-w-sm"
					/>
				</div>
			)}

			{/* 桌面版：表格 */}
			<div className="hidden lg:block">
				<div className="rounded-md">
					<Table className="table-fixed">
						<colgroup>
							<col style={{ width: "50px" }} />
						</colgroup>
						{features.header !== false && (
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow
										key={headerGroup.id}
										className="hover:bg-transparent"
									>
										{headerGroup.headers.map((header) => {
											const isFirstTwoColumns =
												header.column.id === "ranking" ||
												header.column.id === "name";
											return (
												<TableHead
													key={header.id}
													className="bg-transparent px-4"
													style={
														header.getSize() !== 150
															? { width: header.getSize() }
															: {}
													}
												>
													{header.isPlaceholder ? null : (
														<div
															className={cn(
																"flex items-center gap-2",
																isFirstTwoColumns ? "" : "justify-end",
																header.column.getCanSort() &&
																	"cursor-pointer select-none"
															)}
															onClick={header.column.getToggleSortingHandler()}
														>
															{flexRender(
																header.column.columnDef.header,
																header.getContext()
															)}
															{features.sort && header.column.getCanSort() && (
																<div>
																	{{
																		asc: <ArrowUp className="h-4 w-4" />,
																		desc: <ArrowDown className="h-4 w-4" />,
																	}[header.column.getIsSorted() as string] ?? (
																		<ArrowUpDown className="h-4 w-4" />
																	)}
																</div>
															)}
														</div>
													)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
						)}
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id} className="px-4">
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={tableColumns.length}
										className="h-24 text-center"
									>
										No data found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* 平板版：簡化表格 */}
			<div className="hidden md:block lg:hidden">
				<div className="rounded-md">
					<Table>
						{features.header !== false && (
							<TableHeader>
								<TableRow>
									<TableHead className="bg-transparent px-4 text-right">
										#
									</TableHead>
									<TableHead className="bg-transparent px-4">Track</TableHead>
									{/* <TableHead className="bg-transparent px-4">積分</TableHead> */}
								</TableRow>
							</TableHeader>
						)}
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow key={row.id}>
										<TableCell className="font-mono px-4 text-right">
											{row.original.ranking}
										</TableCell>
										<TableCell className="px-4">
											<div className="flex items-center gap-2">
												{appearance.showImages !== false &&
													row.original.img && (
														<div className="relative h-10 w-10 overflow-hidden rounded">
															<Image
																src={row.original.img}
																alt={row.original.name}
																fill
																sizes="40px"
																className="object-cover"
															/>
														</div>
													)}
												<div className="min-w-0">
													<p className="truncate font-medium">
														{row.original.name}
													</p>
													{row.original.album?.name && (
														<p className="truncate text-sm text-muted-foreground">
															{row.original.album.name}
														</p>
													)}
												</div>
											</div>
										</TableCell>
										{/* <TableCell className="font-mono px-4">
											{row.original.points || "-"}
										</TableCell> */}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={3} className="h-24 text-center">
										No data found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* 手機版：卡片模式 */}
			<div className="space-y-3 md:hidden">
				{table.getRowModel().rows?.length ? (
					table.getRowModel().rows.map((row) => {
						const item = row.original;
						return (
							<Link
								key={row.id}
								href={`/artist/${item.artistId}/track/${item.id}`}
							>
								<Card className="transition-colors hover:bg-accent/50">
									<CardContent className="p-4">
										<div className="flex items-center gap-3">
											<div className="w-8 text-xl font-bold text-muted-foreground">
												{item.ranking}
											</div>
											{appearance.showImages !== false && item.img && (
												<div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
													<Image
														src={item.img}
														alt={item.name}
														fill
														sizes="56px"
														className="object-cover"
													/>
												</div>
											)}
											<div className="min-w-0 flex-1">
												<h3 className="truncate font-medium">{item.name}</h3>
												{item.album?.name && (
													<p className="truncate text-sm text-muted-foreground">
														{item.album.name}
													</p>
												)}
												{/* <div className="mt-2 flex items-center gap-4 text-sm">
													{item.points && <span>積分: {item.points}</span>}
													{item.rankChange !== undefined &&
														item.rankChange !== 0 && (
															<div
																className={cn("flex items-center gap-1", {
																	"text-green-500": item.rankChange > 0,
																	"text-red-500": item.rankChange < 0,
																})}
															>
																{item.rankChange > 0 ? (
																	<ArrowUp className="h-3 w-3" />
																) : (
																	<ArrowDown className="h-3 w-3" />
																)}
																<span>{Math.abs(item.rankChange)}</span>
															</div>
														)}
													{item.weeks && <span>{item.weeks} 週</span>}
												</div> */}
											</div>
										</div>
									</CardContent>
								</Card>
							</Link>
						);
					})
				) : (
					<div className="py-8 text-center text-muted-foreground">
						No data found
					</div>
				)}
			</div>

			{/* Pagination */}
			{features.pagination && table.getPageCount() > 1 && (
				<div className="flex items-center justify-between space-x-2 py-4">
					<div className="text-sm text-muted-foreground">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
							className="h-8 w-8 p-0"
						>
							<ChevronsLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							className="h-8 w-8 p-0"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							className="h-8 w-8 p-0"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
							className="h-8 w-8 p-0"
						>
							<ChevronsRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
