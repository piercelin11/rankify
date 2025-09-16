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
import { useVirtualizedTable } from "../hooks/useVirtualizedTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdvancedTableFeatures, AdvancedFilters } from "../types";
import { RankingListDataTypeExtend } from "../../types";

type VirtualizedTableBodyProps<T extends RankingListDataTypeExtend> = {
	data: T[];
	columns: ColumnDef<T>[];
	features: AdvancedTableFeatures;
	globalFilter: string;
	onGlobalFilterChange: (value: string) => void;
	advancedFilters?: AdvancedFilters;
	height?: number | string;
	isLoading?: boolean;
	className?: string;
	onRowClick?: (item: T) => void;
	getRowHref?: (item: T) => string;
};

export default function VirtualizedTableBody<
	T extends RankingListDataTypeExtend,
>({
	data,
	columns,
	features,
	globalFilter,
	onGlobalFilterChange,
	advancedFilters,
	height = 600,
	isLoading = false,
	className,
	onRowClick,
	getRowHref,
}: VirtualizedTableBodyProps<T>) {
	const { table, parentRef, visibleRows, paddingTop, paddingBottom } =
		useVirtualizedTable({
			data,
			columns,
			features,
			globalFilter,
			onGlobalFilterChange,
			advancedFilters,
		});

	return (
		<div className={className} style={{ height }}>
			{/* Sticky Header */}
			{features.header !== false && (
				<div className="sticky top-0 z-10">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="hover:bg-transparent">
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
																"-m-1 cursor-pointer select-none rounded p-1 hover:text-neutral-100"
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
																	<ArrowUpDown className="h-4 w-4 opacity-50" />
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
					</Table>
				</div>
			)}

			{/* Scrollable Body */}
			<div
				className="overflow-auto scrollbar-hidden"
				ref={parentRef}
				style={{
					height: `calc(100vh - ${features.header !== false ? "40px" : "0px"} - ${(features.filter !== false  || features.columnSelector !== false) ? "40px" : "0px"} - 450px)`,
				}}
			>
				<Table>
					{/* Column Width Definition */}
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} >
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											className="h-0 invisible p-0"
											style={
												header.getSize() !== 150
													? { width: header.getSize() }
													: {}
											}
										/>
									);
								})}
							</TableRow>
						))}
					</TableHeader>

					{/* Table Body */}
					<TableBody>
						{paddingTop > 0 && (
							<tr>
								<td style={{ height: paddingTop }} />
							</tr>
						)}
						{/* Visible rows */}
						{visibleRows.length > 0 ? (
							visibleRows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className={cn(
										"hover:bg-neutral-900",
										(onRowClick || getRowHref) && "cursor-pointer hover:bg-muted/70"
									)}
									onClick={() => onRowClick?.(row.original)}
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
									colSpan={columns.length}
									className="h-24 text-center"
								>
									{isLoading ? (
										<div className="flex items-center justify-center gap-2">
											<Loader2 className="h-4 w-4 animate-spin" />
											Loading...
										</div>
									) : (
										"No data found"
									)}
								</TableCell>
							</TableRow>
						)}

						{/* Padding for virtualization */}
						{paddingBottom > 0 && (
							<tr>
								<td style={{ height: paddingBottom }} />
							</tr>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
