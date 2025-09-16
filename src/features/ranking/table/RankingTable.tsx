"use client";

import { cn } from "@/lib/utils";
import { useRankingTable } from "./hooks/useRankingTable";
import SearchInput from "./components/SearchInput";
import DesktopTable from "./components/DesktopTable";
import TabletTable from "./components/TabletTable";
import MobileCards from "./components/MobileCards";
import Pagination from "./components/Pagination";
import type { RankingListDataTypeExtend, RankingTableProps } from "./types";

export default function RankingTable<T extends RankingListDataTypeExtend>({
	data,
	columnKey = [],
	columns,
	features = {},
	appearance = {},
	className,
}: RankingTableProps<T>) {
	const { table, tableColumns, globalFilter, setGlobalFilter } = useRankingTable({
		data,
		columnKey,
		columns,
		features,
	});

	return (
		<div className={cn("space-y-4", className)}>
			{/* 搜尋功能 */}
			<SearchInput
				globalFilter={globalFilter}
				setGlobalFilter={setGlobalFilter}
				features={features}
			/>

			{/* 桌面版：表格 */}
			<DesktopTable
				table={table}
				tableColumns={tableColumns}
				features={features}
			/>

			{/* 平板版：簡化表格 */}
			<TabletTable
				table={table}
				features={features}
				appearance={appearance}
			/>

			{/* 手機版：卡片模式 */}
			<MobileCards
				table={table}
				appearance={appearance}
			/>

			{/* Pagination */}
			<Pagination
				table={table}
				features={features}
			/>
		</div>
	);
}

// 重新匯出型別以保持向後相容性
export type { RankingTableProps, RankingTableFeatures, RankingTableAppearance } from "./types";
export { RankingTable };