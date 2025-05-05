"use client";
import Link from "next/link";
import React, { useState } from "react";
import DropdownContainer from "./DropdownContainer";
import DropdownTrigger from "./DropdownTrigger";
import DropdownContent from "./DropdownContent";
import DropdownItem from "./DropdownItem";

export type MenuOptionProps = {
	id: string;
	label: string;
	href?: string;
	onClick?: () => void;
};

type DropDownMenuProps = {
	options: MenuOptionProps[];
	defaultValue?: string | React.ReactNode;
};

export default function DropdownMenu({
	options,
	defaultValue,
}: DropDownMenuProps) {
	const [isOpen, setOpen] = useState(false);
	const [selected, setSelected] = useState<string | null>(null);

	function handleItemClick(item: MenuOptionProps) {
		setOpen(false);
		setSelected(item.label);

		if (item.onClick) {
			item.onClick();
		}
	}

	return (
		<DropdownContainer width={300}>
			<DropdownTrigger
				toggleDropdown={() => setOpen((prev) => !prev)}
				isDropdownOpen={isOpen}
			>
				{selected || defaultValue || "Select..."}
			</DropdownTrigger>
			<DropdownContent isDropdownOpen={isOpen}>
				{options.map((menuItem) => {
					if (menuItem.href)
						return (
							<Link
								key={menuItem.id}
								href={menuItem.href}
								replace
							>
								<DropdownItem>
									{menuItem.label}
								</DropdownItem>
							</Link>
						);
					else
						return (
							<DropdownItem
								key={menuItem.id}
								onClick={() => {
									handleItemClick(menuItem);
								}}
							>
								{menuItem.label}
							</DropdownItem>
						);
				})}
			</DropdownContent>
		</DropdownContainer>
	);
}
