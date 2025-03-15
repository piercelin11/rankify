"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlbumData } from "@/types/data";
import { DropdownList, DropdownSelect } from "./DropdownMenu";

type RankingAlbumFilterDropdownProps = {
	menuData: AlbumData[];
};

export default function RankingAlbumFilterDropdown({
	menuData,
}: RankingAlbumFilterDropdownProps) {
	const [isOpen, setOpen] = useState(false);
	const searchParams = useSearchParams();
	const albumQuery = searchParams.get("album");

	function handleMenuItemClick(albumId: string | null) {
		if (albumQuery === albumId) return;
		const params = new URLSearchParams(searchParams);
		if (albumId !== null) {
			params.set("album", albumId);
		} else params.delete("album");
		window.history.replaceState(null, "", `?${params.toString()}`);
		setOpen(false);
	}

	return (
		<div className="relative select-none">
			<DropdownSelect isOpen={isOpen} setOpen={setOpen}>
				{menuData.find((data) => data.id === albumQuery)?.name ?? "Select..."}
			</DropdownSelect>
			<DropdownList isOpen={isOpen}>
				<div
					className="rounded-md px-4 py-3 text-zinc-500 hover:bg-zinc-850 hover:text-zinc-100"
					onClick={() => handleMenuItemClick(null)}
				>
					Select All
				</div>
				{menuData.map((album) => (
					<div
						key={album.id}
						className="rounded-md px-4 py-3 text-zinc-500 hover:bg-zinc-850 hover:text-zinc-100"
						onClick={() => handleMenuItemClick(album.id)}
					>
						{album.name}
					</div>
				))}
			</DropdownList>
		</div>
	);
}
