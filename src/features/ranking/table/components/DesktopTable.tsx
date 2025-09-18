import {
	flexRender,
	Table,
	type ColumnDef,
} from "@tanstack/react-table";
import {
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import {
	Table as UITable,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { RankingListDataTypeExtend, RankingTableFeatures } from "../types";

type DesktopTableProps<T> = {
	table: Table<T>;
	tableColumns: ColumnDef<T>[];
	features: RankingTableFeatures;
	onRowClick?: (item: T) => void;
	getRowHref?: (item: T) => string;
};

export default function DesktopTable<T extends RankingListDataTypeExtend>({
	table,
	tableColumns,
	features,
	onRowClick,
	getRowHref,
}: DesktopTableProps<T>) {
	return (
		<div className="hidden lg:block">
			<div className="rounded-md">
				<UITable className="table-fixed">
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
									className={cn(
										(onRowClick || getRowHref) && "cursor-pointer hover:bg-accent"
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
									colSpan={tableColumns.length}
									className="h-24 text-center"
								>
									No data found
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</UITable>
			</div>
		</div>
	);
}