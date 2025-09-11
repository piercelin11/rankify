"use client";
import React, { useState } from "react";
import DropdownContainer from "@/components/menu/DropdownContainer";
import DropdownTrigger from "@/components/menu/DropdownTrigger";
import DropdownContent from "@/components/menu/DropdownContent";
import DropdownItem from "@/components/menu/DropdownItem";
import CheckBox from "@/components/form/CheckBox";
import { cn } from "@/lib/utils";
import { IoFilter } from "react-icons/io5";

type RankingAlbumFilterProps = {
	dropdownOptions: {
		id: string;
		label: string;
		onClick: () => void;
	}[];
	selectedAlbums: string[];
};

export default function RankingAlbumFilter({
	dropdownOptions,
	selectedAlbums,
}: RankingAlbumFilterProps) {
	const [isOpen, setOpen] = useState(false);
	return (
		<DropdownContainer width={400}>
			<DropdownTrigger
				className="w-max"
				toggleDropdown={() => setOpen((prev) => !prev)}
				isDropdownOpen={isOpen}
				hasIcon={false}
			>
				<IoFilter />
				<p className="me-1">Filter</p>
			</DropdownTrigger>
			<DropdownContent className="py-2" isDropdownOpen={isOpen}>
				{dropdownOptions.map((option) => (
					<DropdownItem
						className="flex items-center gap-2"
						key={option.id}
						onClick={() => {
							option.onClick();
						}}
					>
						{option.id !== "all" && (
							<CheckBox
								className="min-h-5 min-w-5"
								checked={selectedAlbums?.includes(option.id)}
							/>
						)}
						<p
							className={cn(
								"overflow-hidden text-ellipsis text-nowrap text-neutral-500",
								{
									"text-neutral-100": selectedAlbums?.includes(option.id),
									"text-neutral-400": option.id === "all",
								}
							)}
						>
							{option.label}
						</p>
					</DropdownItem>
				))}
			</DropdownContent>
		</DropdownContainer>
	);
}
