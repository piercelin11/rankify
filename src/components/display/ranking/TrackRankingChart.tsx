"use client";

import React, { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import RankingAlbumFilterDropdown from "@/components/menu/RankingAlbumFilterDropdown";
import { AlbumData } from "@/types/data";
import RankingTable, { RankingTableDataTypeExtend } from "./RankingTable";
import { dropdownMenuData } from "@/config/menuData";

type Column<T> = {
	key: keyof T;
	header: string;
};

type TrackRankingChartProps<T> = {
	data: T[];
	albums: AlbumData[];
	columns: Column<T>[];
	title: string;
};

export default function TrackRankingChart<T extends RankingTableDataTypeExtend>({
	albums,
	data,
	columns,
	title,
}: TrackRankingChartProps<T>) {
	const searchParams = useSearchParams();
	const album = searchParams.get("album");
	const sort = searchParams.get("sort") as keyof T | null;
	const order = searchParams.get("order") as "asc" | "desc" | null;

	function sortRanking() {
		let sortedDatas;

		if (sort) {
			if (order === "asc")
				sortedDatas = data.sort((a, b) => Number(a[sort]) - Number(b[sort]));
			else sortedDatas = data.sort((a, b) => Number(b[sort]) - Number(a[sort]));
		} else sortedDatas = data.sort((a, b) => a.ranking - b.ranking);
		if (album) sortedDatas.filter((data) => data.albumId === album);

		return sortedDatas;
	}

	const filteredDatas = sortRanking();

	return (
		<div>
			<div className="mb-10 flex items-center justify-between">
				<RankingAlbumFilterDropdown menuData={albums} />
				<p className="text-zinc-500">{title}</p>
			</div>
			<RankingTable data={filteredDatas} columns={columns} />
		</div>
	);
}
