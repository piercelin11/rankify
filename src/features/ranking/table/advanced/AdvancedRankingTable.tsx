"use client";

import { useState } from "react";
import { useRankingTable } from "../hooks/useRankingTable";
import { useColumnSelector } from "./hooks/useColumnSelector";
import WindowVirtualizedTable from "./components/WindowVirtualizedTable";
import ColumnSelectorPanel from "./components/ColumnSelectorPanel";
import FilterToolbar from "./components/FilterToolbar";
import type { AdvancedRankingTableProps, AdvancedFilters } from "./types";
import type { RankingListDataTypeExtend } from "../types";

const defaultFeatures = {
	sort: true,
	search: true,
	virtualization: true,
	columnSelector: true,
	advancedFilter: true,
	header: true,
};

export default function AdvancedRankingTable<
	T extends RankingListDataTypeExtend,
>({
	data,
	columnKey,
	isLoading = false,
	features = defaultFeatures,
	className,
	availableAlbums = [],
	onRowClick,
}: AdvancedRankingTableProps<T>) {
	const [globalFilter, setGlobalFilter] = useState("");
	const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});

	const { tableColumns: defaultColumns } = useRankingTable({
		data,
		columnKey,
		features,
	});

	const {
		visibleColumns,
		columnOptions,
		visibleCount,
		toggleColumn,
		setAllColumns,
		resetColumns,
	} = useColumnSelector<T>(defaultColumns, undefined, undefined);

	const handleFiltersChange = (filters: AdvancedFilters) => {
		setAdvancedFilters(filters);
	};

	return (
		<div className={className}>
			<div className="px-content pt-content pb-4 flex items-center justify-between gap-4">
				<FilterToolbar
					globalFilter={globalFilter}
					onGlobalFilterChange={setGlobalFilter}
					filters={advancedFilters}
					onFiltersChange={handleFiltersChange}
					showAdvancedFilters={features.advancedFilter}
					availableAlbums={availableAlbums}
				/>
				{features.columnSelector && (
					<ColumnSelectorPanel
						columnOptions={columnOptions}
						visibleCount={visibleCount}
						onToggleColumn={toggleColumn}
						onSetAllColumns={setAllColumns}
						onResetColumns={resetColumns}
					/>
				)}
			</div>

			<WindowVirtualizedTable
				data={data}
				columns={visibleColumns}
				features={features}
				globalFilter={globalFilter}
				onGlobalFilterChange={setGlobalFilter}
				advancedFilters={advancedFilters}
				isLoading={isLoading}
				onRowClick={onRowClick}
			/>

			{!isLoading && data.length === 0 && (
				<div className="py-8 text-center text-muted-foreground">
					No tracks found
				</div>
			)}
		</div>
	);
}

// 重新匯出相關型別
export type {
	AdvancedRankingTableProps,
	AdvancedTableFeatures,
	AdvancedFilters,
	ColumnVisibility,
	ScrollMode,
} from "./types";
