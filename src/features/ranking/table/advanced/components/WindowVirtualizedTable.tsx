"use client";

import React, { useEffect, useState, useRef } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { flexRender } from "@tanstack/react-table";
import {
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	Loader2,
} from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useVirtualizedTable } from "../hooks/useVirtualizedTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdvancedTableFeatures, AdvancedFilters } from "../types";
import { RankingListDataTypeExtend } from "../../types";

const ROW_HEIGHT = 70;
const OVERSCAN = 5;

type WindowVirtualizedTableProps<T extends RankingListDataTypeExtend> = {
	data: T[];
	columns: ColumnDef<T>[];
	features: AdvancedTableFeatures;
	globalFilter: string;
	onGlobalFilterChange: (value: string) => void;
	advancedFilters?: AdvancedFilters;
	isLoading?: boolean;
	className?: string;
	onRowClick?: (item: T) => void;
};

export default function WindowVirtualizedTable<
	T extends RankingListDataTypeExtend,
>({
	data,
	columns,
	features,
	globalFilter,
	onGlobalFilterChange,
	advancedFilters,
	isLoading = false,
	className,
	onRowClick,
}: WindowVirtualizedTableProps<T>) {
	const [isClient, setIsClient] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const { table } = useVirtualizedTable({
		data,
		columns,
		features,
		globalFilter,
		onGlobalFilterChange,
		advancedFilters,
	});

	const { rows } = table.getRowModel();

	const [scrollMargin, setScrollMargin] = useState(0);

	useEffect(() => {
		if (!isClient) return;

		const updateScrollMargin = () => {
			if (listRef.current) {
				const rect = listRef.current.getBoundingClientRect();
				const margin = window.pageYOffset + rect.top;
				setScrollMargin(margin);
			}
		};

		updateScrollMargin();
		const timer = setTimeout(updateScrollMargin, 100);
		window.addEventListener('resize', updateScrollMargin);

		return () => {
			clearTimeout(timer);
			window.removeEventListener('resize', updateScrollMargin);
		};
	}, [isClient]);

	const virtualizer = useWindowVirtualizer({
		count: rows.length,
		estimateSize: () => ROW_HEIGHT,
		overscan: OVERSCAN,
		scrollMargin: scrollMargin,
	});

	const items = virtualizer.getVirtualItems();


	if (!isClient) {
		return (
			<div className={cn("h-24 flex items-center justify-center", className)}>
				<div className="text-center text-muted-foreground">
					Loading...
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="h-24 flex items-center justify-center">
				<div className="flex items-center gap-2">
					<Loader2 className="h-4 w-4 animate-spin" />
					Loading...
				</div>
			</div>
		);
	}

	if (!rows.length) {
		return (
			<div className="h-24 flex items-center justify-center">
				<div className="text-center text-muted-foreground">
					No data found
				</div>
			</div>
		);
	}

	return (
		<div className={className} ref={listRef}>
			{features.header !== false && (
				<div className="sticky top-0 z-10">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="hover:bg-transparent">
									{headerGroup.headers.map((header) => {
										const isLeftAligned = header.column.id === "ranking" || header.column.id === "name";
										const canSort = header.column.getCanSort();
										const sortState = header.column.getIsSorted();

										return (
											<TableHead
												key={header.id}
												className="bg-transparent px-4"
												style={header.getSize() !== 150 ? { width: header.getSize() } : {}}
											>
												{header.isPlaceholder ? null : (
													<div
														className={cn(
															"flex items-center gap-2",
															isLeftAligned ? "" : "justify-end",
															canSort && "-m-1 cursor-pointer select-none rounded p-1 hover:text-foreground"
														)}
														onClick={header.column.getToggleSortingHandler()}
													>
														{flexRender(header.column.columnDef.header, header.getContext())}
														{features.sort && canSort && (
															<div>
																{sortState === 'asc' && <ArrowUp className="h-4 w-4" />}
																{sortState === 'desc' && <ArrowDown className="h-4 w-4" />}
																{!sortState && <ArrowUpDown className="h-4 w-4 opacity-50" />}
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
					</Table>
				</div>
			)}

			<div
				style={{
					height: virtualizer.getTotalSize(),
					width: '100%',
					position: 'relative',
				}}
			>
				{items.map((virtualItem) => {
					const row = rows[virtualItem.index];
					if (!row) return null;

					return (
						<div
							key={virtualItem.key}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: `${virtualItem.size}px`,
								transform: `translateY(${virtualItem.start - (scrollMargin || 0)}px)`,
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
													style={header.getSize() !== 150 ? { width: header.getSize() } : {}}
												/>
											))}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									<TableRow
										data-state={row.getIsSelected() && "selected"}
										className={cn(
											"hover:bg-neutral-900",
											onRowClick && "cursor-pointer hover:bg-muted/70"
										)}
										onClick={() => onRowClick?.(row.original)}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id} className="px-4">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
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
	);
}