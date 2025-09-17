"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import type { FilterTag, ComparisonData, LineChartFilterState } from "../types";
import { useUrlState } from "./useUrlState";

export default function useLineChartFilter(
	defaultTag: FilterTag,
	onLoadComparisonData?: (ids: string[]) => Promise<ComparisonData[]>
): LineChartFilterState {
	const [isOpen, setOpen] = useState(false);
	const [filteredParentId, setFilterParentId] = useState<string | null>(null);
	const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
	const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
	const [isPending, startTransition] = useTransition();
	const [isInitialized, setIsInitialized] = useState(false);

	const { addToArray, removeFromArray, clearArray, getArray } = useUrlState();
	const comparisonQuery = getArray("comparison");

	// 初始化時檢查 URL params 並載入對應資料
	useEffect(() => {
		if (comparisonQuery.length > 0 && onLoadComparisonData && !isInitialized) {
			setIsInitialized(true);
			setLoadingIds(new Set(comparisonQuery));

			startTransition(async () => {
				try {
					const data = await onLoadComparisonData(comparisonQuery);
					setComparisonData(data);
				} catch (error) {
					console.error("Failed to load initial comparison data:", error);
				} finally {
					setLoadingIds(new Set());
				}
			});
		} else if (comparisonQuery.length === 0 && !isInitialized) {
			setComparisonData([]);
			setIsInitialized(true);
		}
	}, [onLoadComparisonData, isInitialized, comparisonQuery]);

	const handleAlbumFilter = useCallback((parentId: string) => {
		if (parentId === filteredParentId) {
			setFilterParentId(null);
		} else {
			setFilterParentId(parentId);
		}
	}, [filteredParentId]);

	const handleMenuItemClick = useCallback((menuId: string) => {
		// 防止重複選擇
		if (comparisonQuery.includes(menuId) || menuId === defaultTag.id) {
			return;
		}

		addToArray("comparison", menuId);
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
	}, [addToArray, comparisonQuery, defaultTag.id, onLoadComparisonData, comparisonData]);

	const handleTagDelete = useCallback((menuId: string) => {
		removeFromArray("comparison", menuId);

		// 移除對應的資料
		setComparisonData(prev => prev.filter(d => d.id !== menuId));
	}, [removeFromArray]);

	const handleClearAll = useCallback(() => {
		clearArray("comparison");

		// 清空所有比較資料
		setComparisonData([]);
	}, [clearArray]);

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