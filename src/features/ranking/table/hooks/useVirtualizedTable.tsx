import { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import type { RankingListDataTypeExtend } from "../types";
import type { AdvancedFilters } from "../types";

export function useVirtualizedTable<T extends RankingListDataTypeExtend>({
	data,
	columns,
	globalFilter,
	onGlobalFilterChange,
	advancedFilters = {},
	estimateSize = () => 60,
	overscan = 5,
}: {
	data: T[];
	columns: ColumnDef<T>[];
	globalFilter?: string;
	onGlobalFilterChange?: (value: string) => void;
	advancedFilters?: AdvancedFilters;
	estimateSize?: () => number;
	overscan?: number;
}) {
	const parentRef = useRef<HTMLDivElement>(null);

	// 預先過濾資料
	const filteredData = useMemo(() => {
		let filtered = [...data];

		// 專輯過濾
		if (advancedFilters.albums && advancedFilters.albums.length > 0) {
			filtered = filtered.filter((item) => {
				// 處理 TrackStatsType 的 album.name 結構
				const albumName = 'album' in item && item.album && typeof item.album === 'object'
					? (item.album as { name: string | null }).name || ''
					: '';
				return advancedFilters.albums!.includes(albumName);
			});
		}

		return filtered;
	}, [data, advancedFilters]);

	// React Table 設定
	const table = useReactTable({
		data: filteredData,
		columns,
		state: {
			globalFilter: globalFilter || "",
		},
		onGlobalFilterChange,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	const { rows } = table.getRowModel();

	// 虛擬化設定
	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize,
		overscan,
	});

	const virtualItems = virtualizer.getVirtualItems();


	// 計算虛擬化相關數值
	const totalSize = virtualizer.getTotalSize();
	const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0;
	const paddingBottom =
		virtualItems.length > 0
			? totalSize - (virtualItems[virtualItems.length - 1]?.end || 0)
			: 0;

	// 可見行資料
	const visibleRows = useMemo(() => {
		return virtualItems.map((virtualItem) => {
			const row = rows[virtualItem.index];
			return {
				...row,
				virtualItem,
			};
		});
	}, [virtualItems, rows]);

	return {
		table,
		virtualizer,
		parentRef,
		visibleRows,
		paddingTop,
		paddingBottom,
		totalSize,
		scrollToIndex: virtualizer.scrollToIndex,
		scrollToOffset: virtualizer.scrollToOffset,
	};
}