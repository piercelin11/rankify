import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";
import type { RankingListDataTypeExtend } from "../types";
import { createColumns, COLUMN_CONFIGS } from "../utils/columnFactory";

export function useRankingTable<T extends RankingListDataTypeExtend>({
	data,
	columnKey = [],
	columns,
}: {
	data: T[];
	columnKey?: (keyof T)[];
	columns?: ColumnDef<T>[];
}) {
	const [globalFilter, setGlobalFilter] = useState("");

	// 使用自定義欄位或根據 columnKey 創建欄位
	const tableColumns: ColumnDef<T>[] =
		columns ||
		(() => {
			// 確保 ranking 和 name 欄位總是存在
			const requiredColumns: (keyof typeof COLUMN_CONFIGS)[] = [
				"rank",
				"name",
			];
			const validColumnKeys = columnKey.filter(
				(key) => COLUMN_CONFIGS[key as keyof typeof COLUMN_CONFIGS]
			) as (keyof typeof COLUMN_CONFIGS)[];

			const selectedColumns = [
				...requiredColumns,
				...validColumnKeys.filter((key) => !requiredColumns.includes(key)),
			];

			return createColumns(selectedColumns) as ColumnDef<T>[];
		})();

	// React Table 設定
	const table = useReactTable({
		data,
		columns: tableColumns,
		state: {
			globalFilter,
		},
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	return {
		table,
		tableColumns,
		globalFilter,
		setGlobalFilter,
	};
}
