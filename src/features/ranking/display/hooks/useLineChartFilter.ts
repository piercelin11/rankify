"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { MenuOptionType } from "../components/LineChartFilterDropdown";

export default function useLinechartFilter(defaultTag: MenuOptionType) {
	const [isOpen, setOPen] = useState(false);
	const [filteredParentId, setFilterParentId] = useState<string | null>(null);
	const searchParams = useSearchParams();
	const comparisonQuery = searchParams.getAll("comparison");

	function handleAlbumFilter(parentId: string) {
		if (parentId === filteredParentId) setFilterParentId(null);
		else setFilterParentId(parentId);
	}

	function handleMenuItemClick(menuId: string) {
		const params = new URLSearchParams(searchParams);
		if (comparisonQuery.includes(menuId)) return null;
		if (menuId === defaultTag.id) return null;
		params.append("comparison", menuId);
		setOPen(false);
		window.history.replaceState(null, "", `?${params.toString()}`);
	}

	function handleTagDelete(menuId: string) {
		const params = new URLSearchParams(searchParams);
		const newQuery = comparisonQuery.filter((query) => query !== menuId);
		params.delete("comparison");
		for (const query of newQuery) {
			params.append("comparison", query);
		}
		window.history.replaceState(null, "", `?${params.toString()}`);
	}

	return {
		setOPen,
		isOpen,
		comparisonQuery,
		filteredParentId,
		handleAlbumFilter,
		handleMenuItemClick,
		handleTagDelete,
	};
}
