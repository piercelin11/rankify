import { Table } from "@tanstack/react-table";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RankingListDataTypeExtend, RankingTableFeatures } from "../types";

type PaginationProps<T> = {
	table: Table<T>;
	features: RankingTableFeatures;
};

export default function Pagination<T extends RankingListDataTypeExtend>({
	table,
	features,
}: PaginationProps<T>) {
	if (!features.pagination || table.getPageCount() <= 1) return null;

	return (
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
	);
}