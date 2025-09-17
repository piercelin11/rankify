"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRankingTable } from "../hooks/useRankingTable";
import { useColumnSelector } from "./hooks/useColumnSelector";
import VirtualizedTableBody from "./components/VirtualizedTableBody";
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
	//appearance = {},
	className,
	onFiltersChange,
	onColumnsChange,
	availableAlbums = [],
	onRowClick,
	getRowHref,
}: AdvancedRankingTableProps<T>) {
	const [globalFilter, setGlobalFilter] = useState("");
	const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});

	// 使用基礎的 ranking table hook 來獲取預設欄位
	const { tableColumns: defaultColumns } = useRankingTable({
		data,
		columnKey,
		features,
	});

	// 欄位選擇器
	const {
		visibleColumns,
		columnOptions,
		visibleCount,
		toggleColumn,
		setAllColumns,
		resetColumns,
	} = useColumnSelector<T>(
		defaultColumns,
		undefined, // 使用預設可見性
		onColumnsChange
	);

	// 處理過濾器變更
	const handleFiltersChange = (filters: AdvancedFilters) => {
		setAdvancedFilters(filters);
		onFiltersChange?.(filters);
	};

	return (
		<div className={cn("space-y-4", className)}>
			<div className="flex items-center justify-between gap-4">
				{/* 搜尋和過濾 */}
				<FilterToolbar
					globalFilter={globalFilter}
					onGlobalFilterChange={setGlobalFilter}
					filters={advancedFilters}
					onFiltersChange={handleFiltersChange}
					showAdvancedFilters={features.advancedFilter}
					availableAlbums={availableAlbums}
				/>
				{/* {totalCount !== undefined && (
					<div className="text-sm text-muted-foreground">
						{data.length} of {totalCount} tracks
					</div>
				)} */}
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

			<VirtualizedTableBody
				data={data}
				columns={visibleColumns}
				features={features}
				globalFilter={globalFilter}
				onGlobalFilterChange={setGlobalFilter}
				advancedFilters={advancedFilters}
				height={600}
				isLoading={isLoading}
				onRowClick={onRowClick}
				getRowHref={getRowHref}
			/>

			{/* 狀態信息 */}
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
} from "./types";
