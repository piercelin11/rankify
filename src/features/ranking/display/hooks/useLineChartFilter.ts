"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { MenuOptionType } from "../components/LineChartFilter";

export default function useLinechartFilter(defaultTag: MenuOptionType) {
	const [isOpen, setOpen] = useState(false);
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
		setOpen(false);
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
		setOpen,
		isOpen,
		comparisonQuery,
		filteredParentId,
		handleAlbumFilter,
		handleMenuItemClick,
		handleTagDelete,
	};
}
