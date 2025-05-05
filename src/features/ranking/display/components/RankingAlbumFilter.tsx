"use client";
import React, { useState } from "react";
import DropdownContainer from "@/components/menu/DropdownContainer";
import DropdownTrigger from "@/components/menu/DropdownTrigger";
import DropdownContent from "@/components/menu/DropdownContent";
import DropdownItem from "@/components/menu/DropdownItem";

type RankingAlbumFilterProps = {
	dropdownOptions: {
		id: string;
		label: string;
		onClick: () => void;
	}[];
	selectedAlbum?: string | null;
};

export default function RankingAlbumFilter({
	dropdownOptions,
	selectedAlbum,
}: RankingAlbumFilterProps) {
	const [isOpen, setOpen] = useState(false);
	return (
		<DropdownContainer width={400}>
			<DropdownTrigger
				toggleDropdown={() => setOpen((prev) => !prev)}
				isDropdownOpen={isOpen}
			>
				{selectedAlbum ? <p className="text-nowrap text-ellipsis overflow-hidden">{selectedAlbum}</p> : "Select..."}
			</DropdownTrigger>
			<DropdownContent isDropdownOpen={isOpen}>
				{dropdownOptions.map((option) => (
					<DropdownItem
						key={option.id}
						onClick={() => {
							option.onClick();
							setOpen(false);
						}}
					>
						{option.label}
					</DropdownItem>
				))}
			</DropdownContent>
		</DropdownContainer>
	);
}
