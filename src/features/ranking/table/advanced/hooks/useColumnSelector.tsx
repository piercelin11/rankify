import { useState, useCallback, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ColumnVisibility } from "../types";
import type { RankingListDataTypeExtend } from "../../types";

const DEFAULT_VISIBLE_COLUMNS: ColumnVisibility = {
	ranking: true,
	name: true,
	rankChange: true,
	peak: true,
	worst: false,
	averageRanking: true,
	top50PercentCount: false,
	top25PercentCount: false,
	top5PercentCount: false,
};

const COLUMN_LABELS: Record<keyof ColumnVisibility, string> = {
	ranking: "#",
	name: "Track",
	rankChange: "Change",
	peak: "Peak",
	worst: "Worst",
	averageRanking: "Avg.",
	top50PercentCount: "Top 50%",
	top25PercentCount: "Top 25%",
	top5PercentCount: "Top 5%",
};

export function useColumnSelector<T extends RankingListDataTypeExtend>(
	defaultColumns: ColumnDef<T>[],
	initialVisibility?: Partial<ColumnVisibility>,
	onColumnsChange?: (columns: ColumnVisibility) => void
) {
	const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
		...DEFAULT_VISIBLE_COLUMNS,
		...initialVisibility,
	});

	const toggleColumn = useCallback((columnKey: keyof ColumnVisibility) => {
		setColumnVisibility(prev => {
			const newVisibility = {
				...prev,
				[columnKey]: !prev[columnKey],
			};
			onColumnsChange?.(newVisibility);
			return newVisibility;
		});
	}, [onColumnsChange]);

	const setAllColumns = useCallback((visible: boolean) => {
		setColumnVisibility(prev => {
			const newVisibility = Object.keys(prev).reduce(
				(acc, key) => ({
					...acc,
					[key]: visible,
				}),
				{} as ColumnVisibility
			);
			onColumnsChange?.(newVisibility);
			return newVisibility;
		});
	}, [onColumnsChange]);

	const resetColumns = useCallback(() => {
		setColumnVisibility(DEFAULT_VISIBLE_COLUMNS);
		onColumnsChange?.(DEFAULT_VISIBLE_COLUMNS);
	}, [onColumnsChange]);

	const visibleColumns = useMemo(() => {
		return defaultColumns.filter((column) => {
			if (!("accessorKey" in column)) return true;

			const key = column.accessorKey as keyof ColumnVisibility;
			return columnVisibility[key] ?? true;
		});
	}, [defaultColumns, columnVisibility]);

	const columnOptions = useMemo(() => {
		return Object.entries(COLUMN_LABELS).map(([key, label]) => ({
			key: key as keyof ColumnVisibility,
			label,
			visible: columnVisibility[key as keyof ColumnVisibility],
		}));
	}, [columnVisibility]);

	const visibleCount = useMemo(() => {
		return Object.values(columnVisibility).filter(Boolean).length;
	}, [columnVisibility]);

	return {
		columnVisibility,
		visibleColumns,
		columnOptions,
		visibleCount,
		toggleColumn,
		setAllColumns,
		resetColumns,
	};
}