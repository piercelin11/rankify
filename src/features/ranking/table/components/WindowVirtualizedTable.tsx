"use client";

import React, { useEffect, useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { flexRender } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useStickyState } from "@/lib/hooks/useStickyState";
import { useVirtualizedTable } from "../hooks/useVirtualizedTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdvancedFilters } from "../types";
import { RankingListDataTypeExtend } from "../types";
import { useRouter } from "next/navigation";

const ROW_HEIGHT = 70;
const OVERSCAN = 8;

type WindowVirtualizedTableProps<T extends RankingListDataTypeExtend> = {
	data: T[];
	columns: ColumnDef<T>[];
	globalFilter: string;
	onGlobalFilterChange: (value: string) => void;
	advancedFilters?: AdvancedFilters;
	isLoading?: boolean;
};

export default function WindowVirtualizedTable<
	T extends RankingListDataTypeExtend,
>({
	data,
	columns,
	globalFilter,
	onGlobalFilterChange,
	advancedFilters,
	isLoading = false,
}: WindowVirtualizedTableProps<T>) {
	const [isClient, setIsClient] = useState(false);
	const router = useRouter();
	const listRef = useRef<HTMLDivElement>(null);

	function handleRowClick(item: RankingListDataTypeExtend) {
		router.push(`/artist/${item.artistId}/track/${item.id}`);
	}
	const { isStuck, sentinelRef } = useStickyState({
		rootMargin: "50px",
		threshold: 0,
	});

	useEffect(() => {
		setIsClient(true);
	}, []);

	const { table } = useVirtualizedTable({
		data,
		columns,
		globalFilter,
		onGlobalFilterChange,
		advancedFilters,
	});

	const { rows } = table.getRowModel();

	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => listRef.current?.closest('[data-scroll-container]') as HTMLElement | null,
		estimateSize: () => ROW_HEIGHT,
		overscan: OVERSCAN,
	});

	const items = virtualizer.getVirtualItems();

	if (!isClient) {
		return (
			<div className="flex h-24 items-center justify-center">
				<div className="text-center text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex h-24 items-center justify-center">
				<div className="flex items-center gap-2">
					<Loader2 className="h-4 w-4 animate-spin" />
					Loading...
				</div>
			</div>
		);
	}

	if (!rows.length) {
		return (
			<div className="flex h-24 items-center justify-center">
				<div className="text-center text-muted-foreground">No data found</div>
			</div>
		);
	}

	return (
		<div>
			<div ref={sentinelRef} className="h-0" />
			<div
				className={cn(
					"sticky top-header z-10 border-b",
					isStuck ? "backdrop-blur bg-black" : ""
				)}
			>
				<Table>
					<TableHeader className={cn({ "border-b": !isStuck })}>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className="border-transparent hover:bg-transparent"
							>
								{headerGroup.headers.map((header) => {
									const isLeftAligned =
										header.column.id === "ranking" ||
										header.column.id === "name";
									const canSort = header.column.getCanSort();
									const sortState = header.column.getIsSorted();

									return (
										<TableHead
											key={header.id}
											className={cn("bg-transparent px-4")}
											style={
												header.getSize() !== 150
													? { width: header.getSize() }
													: {}
											}
										>
											{header.isPlaceholder ? null : (
												<div
													className={cn(
														"flex items-center gap-2 text-secondary-foreground",
														isLeftAligned ? "" : "justify-end"
													)}
												>
													{canSort ? (
														<button
															type="button"
															onClick={header.column.getToggleSortingHandler()}
															className={cn(
																"flex items-center gap-1.5",
																"appearance-none bg-transparent border-0 p-0",
																"cursor-pointer hover:text-foreground transition-colors"
															)}
														>
															<span>
																{flexRender(
																	header.column.columnDef.header,
																	header.getContext()
																)}
															</span>
															{sortState === "asc" && (
																<ArrowUp className="h-4 w-4" />
															)}
															{sortState === "desc" && (
																<ArrowDown className="h-4 w-4" />
															)}
															{!sortState && (
																<ArrowUpDown className="h-4 w-4 opacity-50" />
															)}
														</button>
													) : (
														<span>
															{flexRender(
																header.column.columnDef.header,
																header.getContext()
															)}
														</span>
													)}
												</div>
											)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
				</Table>
			</div>

			<div ref={listRef} className="mt-4">
				<div
					style={{
						height: virtualizer.getTotalSize(),
						width: "100%",
						position: "relative",
					}}
				>
					{items.map((virtualItem) => {
						const row = rows[virtualItem.index];
						if (!row) return null;

						return (
							<div
								key={virtualItem.key}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: `${virtualItem.size}px`,
									transform: `translateY(${virtualItem.start}px)`,
								}}
							>
								<Table>
									<TableHeader>
										{table.getHeaderGroups().map((headerGroup) => (
											<TableRow key={headerGroup.id}>
												{headerGroup.headers.map((header) => (
													<TableHead
														key={header.id}
														className="invisible h-0 p-0"
														style={
															header.getSize() !== 150
																? { width: header.getSize() }
																: {}
														}
													/>
												))}
											</TableRow>
										))}
									</TableHeader>
									<TableBody>
										<TableRow
											data-state={row.getIsSelected() && "selected"}
											className={cn("cursor-pointer")}
											onClick={() => handleRowClick(row.original)}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</TableCell>
											))}
										</TableRow>
									</TableBody>
								</Table>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
