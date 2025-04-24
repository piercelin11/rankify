"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlbumData } from "@/types/data";
import DropdownContainer from "@/components/menu/DropdownContainer";
import DropdownTrigger from "@/components/menu/DropdownTrigger";
import DropdownContent from "@/components/menu/DropdownContent";
import DropdownItem from "@/components/menu/DropdownItem";

type RankingAlbumFilterProps = {
	menuData: AlbumData[];
};

export default function RankingAlbumFilter({
	menuData,
}: RankingAlbumFilterProps) {
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
		<DropdownContainer width={300}>
			<DropdownTrigger
				toggleDropdown={() => setOpen((prev) => !prev)}
				isDropdownOpen={isOpen}
			>
				{menuData.find((data) => data.id === albumQuery)?.name ?? "Select..."}
			</DropdownTrigger>
			<DropdownContent isDropdownOpen={isOpen}>
				<DropdownItem onClick={() => handleMenuItemClick(null)}>
					Select All
				</DropdownItem>
				{menuData.map((album) => (
					<DropdownItem
						key={album.id}
						onClick={() => handleMenuItemClick(album.id)}
					>
						{album.name}
					</DropdownItem>
				))}
			</DropdownContent>
		</DropdownContainer>
	);
}
