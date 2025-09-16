"use client";

import { useSearchParams } from "next/navigation";
import { useState, useCallback, useTransition } from "react";

export type FilterTag = {
	id: string;
	name: string;
	color: string | null;
};

export type DynamicTrackData = {
	id: string;
	name: string;
	color: string | null;
	rankings?: Array<{
		ranking: number;
		rankPercentile: number;
		rankChange: number | null;
		date: Date;
		dateId: string;
	}>;
};

export default function useLineChartFilter(
	defaultTag: FilterTag,
	onLoadComparisonData?: (trackIds: string[]) => Promise<DynamicTrackData[]>
) {
	const [isOpen, setOpen] = useState(false);
	const [filteredParentId, setFilterParentId] = useState<string | null>(null);
	const [comparisonData, setComparisonData] = useState<DynamicTrackData[]>([]);
	const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
	const [isPending, startTransition] = useTransition();

	const searchParams = useSearchParams();
	const comparisonQuery = searchParams.getAll("comparison");

	const handleAlbumFilter = useCallback((parentId: string) => {
		if (parentId === filteredParentId) {
			setFilterParentId(null);
		} else {
			setFilterParentId(parentId);
		}
	}, [filteredParentId]);

	const handleMenuItemClick = useCallback((menuId: string) => {
		const params = new URLSearchParams(searchParams);

		// 防止重複選擇
		if (comparisonQuery.includes(menuId) || menuId === defaultTag.id) {
			return;
		}

		params.append("comparison", menuId);
		setOpen(false);

		// 載入資料（如果提供了載入函式）
		if (onLoadComparisonData && !comparisonData.find(d => d.id === menuId)) {
			setLoadingIds(prev => new Set([...prev, menuId]));

			startTransition(async () => {
				try {
					const newData = await onLoadComparisonData([menuId]);
					setComparisonData(prev => [
						...prev.filter(d => d.id !== menuId), // 避免重複
						...newData
					]);
				} catch (error) {
					console.error("Failed to load comparison data:", error);
				} finally {
					setLoadingIds(prev => {
						const newSet = new Set(prev);
						newSet.delete(menuId);
						return newSet;
					});
				}
			});
		}

		window.history.replaceState(null, "", `?${params.toString()}`);
	}, [searchParams, comparisonQuery, defaultTag.id, onLoadComparisonData, comparisonData]);

	const handleTagDelete = useCallback((menuId: string) => {
		const params = new URLSearchParams(searchParams);
		const newQuery = comparisonQuery.filter((query) => query !== menuId);

		params.delete("comparison");
		for (const query of newQuery) {
			params.append("comparison", query);
		}

		// 移除對應的資料
		setComparisonData(prev => prev.filter(d => d.id !== menuId));

		window.history.replaceState(null, "", `?${params.toString()}`);
	}, [searchParams, comparisonQuery]);

	const handleClearAll = useCallback(() => {
		const params = new URLSearchParams(searchParams);
		params.delete("comparison");

		// 清空所有比較資料
		setComparisonData([]);

		window.history.replaceState(null, "", `?${params.toString()}`);
	}, [searchParams]);

	return {
		isOpen,
		setOpen,
		comparisonQuery,
		comparisonData,
		loadingIds,
		isPending,
		filteredParentId,
		handleAlbumFilter,
		handleMenuItemClick,
		handleTagDelete,
		handleClearAll,
	};
}