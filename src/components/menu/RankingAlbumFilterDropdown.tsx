"use client";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React, { useState } from "react";
import { menuItemProps } from "./Tabs";
import { useSearchParams } from "next/navigation";
import { AlbumData } from "@/types/data";

type RankingAlbumFilterDropdownProps = {
	menuData: AlbumData[];
	defaultValue?: string;
};

export default function RankingAlbumFilterDropdown({
	menuData,
	defaultValue,
}: RankingAlbumFilterDropdownProps) {
	const [isOpen, setOPen] = useState(false);
	const searchParams = useSearchParams();
	const albumQuery = searchParams.get("album");

	function handleMenuItemClick(albumId: string | null) {
		if (albumQuery === albumId) return;
		const params = new URLSearchParams(searchParams);
		if (albumId !== null) {
			params.set("album", albumId);
		} else params.delete("album");
		window.history.replaceState(null, "", `?${params.toString()}`);
		setOPen(false);
	}

	return (
		<div className="relative select-none">
			<div
				className="flex justify-between rounded-md bg-zinc-900 px-4 py-3 text-zinc-400 hover:text-zinc-300 hover:outline hover:outline-1 hover:outline-zinc-700"
				onClick={() => setOPen((prev) => !prev)}
			>
				<div
					className={cn("min-w-52", {
						"text-zinc-100": isOpen,
					})}
				>
					{menuData.find(data => data.id === albumQuery)?.name ?? "Select..."}
				</div>
				<ChevronDownIcon
					className={cn("self-center text-zinc-400 transition ease-in-out", {
						"rotate-180 transform text-zinc-600": isOpen,
					})}
					width={18}
					height={18}
				/>
			</div>
			<div
				className={cn(
					"absolute max-h-64 w-full overflow-auto rounded-md bg-zinc-900 opacity-0 transition ease-in-out",
					{
						"translate-y-3 opacity-100": isOpen,
						"pointer-events-none": !isOpen,
					}
				)}
			>
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
			</div>
		</div>
	);
}
