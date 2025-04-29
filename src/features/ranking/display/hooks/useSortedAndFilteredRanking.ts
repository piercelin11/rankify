"use client";

import { useMemo, useState } from "react";
import { RankingListDataTypeExtend } from "../components/RankingList";
import { AlbumData } from "@/types/data";

export default function useSortedAndFilteredRanking<
	T extends RankingListDataTypeExtend,
>(trackRankings: T[], albums: AlbumData[]) {
	const dropdownOptions = albums.map((album) => ({
		id: album.id,
		label: album.name,
		onClick: () => setAlbumIdFilter(album.id),
	}));

	const [albumIdFilter, setAlbumIdFilter] = useState<string | null>(null);
	const [sortKey, setSortKey] = useState<keyof T | null>(null);
	const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

	function handleHeaderClick(key: keyof T) {
		if (sortKey === key) {
			if (sortOrder === "asc") {
				setSortOrder("desc");
			} else {
				setSortOrder(null);
				setSortKey(null);
			}
		} else {
			setSortKey(key);
			setSortOrder("asc");
		}
	}

	function sortedAndFiltered() {
		let filteredRankings = trackRankings;

		if (albumIdFilter) {
			filteredRankings = trackRankings.filter(
				(track) => track.albumId === albumIdFilter
			);
		}

		if (sortKey) {
			filteredRankings = filteredRankings.toSorted((a, b) => {
				let comparison = 0;
				const valA = a[sortKey];
				const valB = b[sortKey];

				if (valA == null || valB == null) return 0;
				if (valA == null) return 1;
				if (valB == null) return -1;

				if (typeof valA === "number" && typeof valB === "number") {
					comparison = valA - valB;
				} else if (
					typeof Number(valA) === "number" &&
					typeof Number(valB) === "number"
				) {
					comparison = Number(valA) - Number(valB);
				} else if (typeof valA === "string" && typeof valB === "string") {
					comparison = valA.localeCompare(valB);
				} else if (valA instanceof Date && valB instanceof Date) {
					comparison = valA.getTime() - valB.getTime();
				} else {
					try {
						comparison = String(valA).localeCompare(String(valB));
					} catch (err) {
						comparison = 0;
					}
				}

				return sortOrder === "asc" ? comparison : -comparison;
			});
		} else {
			filteredRankings = filteredRankings.toSorted(
				(a, b) => a.ranking - b.ranking
			);
		}

		return filteredRankings;
	}

	const sortedAndFilteredRankings = sortedAndFiltered();

	return {
		sortedAndFilteredRankings,
		handleHeaderClick,
		dropdownOptions,
		albumIdFilter,
		sortKey,
		sortOrder,
	};
}
