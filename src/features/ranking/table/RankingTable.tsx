"use client";

import { useState } from "react";
import { useRankingTable } from "./hooks/useRankingTable";
import { useColumnSelector } from "./hooks/useColumnSelector";
import WindowVirtualizedTable from "./components/WindowVirtualizedTable";
import ColumnSelectorPanel from "./components/ColumnSelectorPanel";
import FilterToolbar from "./components/FilterToolbar";
import type { RankingTableProps, AdvancedFilters, RankingListDataTypeExtend } from "./types";
import SimpleDropdown from "@/components/dropdown/SimpleDropdown";
import { TIME_RANGE_OPTIONS } from "@/config/timeRangeOptions";
import { useSearchParams } from "next/navigation";

const defaultFeatures = {
	sort: true,
	search: true,
	virtualization: true,
	columnSelector: false,
	advancedFilter: true,
	header: true,
};

export default function RankingTable<
	T extends RankingListDataTypeExtend,
>({
	data,
	columnKey,
	isLoading = false,
	features = defaultFeatures,
	className,
	availableAlbums = [],
	onRowClick,
}: RankingTableProps<T>) {
	const [globalFilter, setGlobalFilter] = useState("");
	const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});

	const searchParams = useSearchParams();
	const range = searchParams.get("range");

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
			<div className="flex items-center justify-between gap-4 px-content pb-4 pt-6">
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
				<SimpleDropdown
					className="w-40"
					options={TIME_RANGE_OPTIONS}
					defaultValue={range || "all-time"}
				/>
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
	RankingTableProps,
	AdvancedTableFeatures,
	AdvancedFilters,
	ColumnVisibility,
} from "./types";
