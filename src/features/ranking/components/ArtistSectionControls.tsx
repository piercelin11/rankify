import DropdownMenu, { MenuOptionProps } from "@/components/menu/DropdownMenu";
import Tabs, { TabOptionProps } from "@/components/navigation/Tabs";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";

type ArtistSectionControlsProps = {
	artistId: string;
	dropdownOptions: MenuOptionProps[];
	dropdownDefaultValue: string;
    tabOptions: TabOptionProps[];
	tabsActiveId: string;
};

export default function ArtistSectionControls({
	artistId,
	dropdownOptions,
	dropdownDefaultValue,
	tabsActiveId,
	tabOptions,
}: ArtistSectionControlsProps) {
	return (
		<div className="flex flex-col justify-between gap-6 sm:flex-row md:items-center">
			<DropdownMenu
				options={dropdownOptions}
				defaultValue={dropdownDefaultValue}
			/>
			<div className="flex gap-4">
				<Tabs activeId={tabsActiveId} options={tabOptions} />
				<Link href={`/sorter/${artistId}`}>
					<div className="aspect-square rounded-full bg-lime-500 p-4 text-zinc-950 hover:bg-zinc-100">
						<PlusIcon width={16} height={16} />
					</div>
				</Link>
			</div>
		</div>
	);
}
