"use client";

import { DEFAULT_COLOR } from "@/config/variables";
import { cn } from "@/lib/cn";
import { TrackStatsType } from "@/lib/database/ranking/overview/getTracksStats";
import { ensureBrightness } from "@/lib/utils/adjustColor";
import { AlbumData } from "@/types/data";
import { ChevronDownIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

type ParentList = {
	id: string;
	color: string | null;
	name: string;
};

type MenuList = ParentList & {
	parentId?: string | null;
};

type MultiTagDropdownProps = {
	defaultTag: MenuList;
	menuLists: MenuList[];
	parentLists?: ParentList[];
};

export default function MultiTagDropdown({
	defaultTag,
	menuLists,
	parentLists,
}: MultiTagDropdownProps) {
	const [isOpen, setOPen] = useState(false);
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
		setOPen(false);
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

	return (
		<div className="relative select-none w-[580px]">
			<div
				className="flex justify-between gap-3 rounded-md bg-zinc-900 p-3"
				onClick={() => setOPen((prev) => !prev)}
			>
				<div className="flex gap-2 overflow-auto scrollbar-hidden">
					<TrackTag tag={defaultTag} isDefault={true} />
					{comparisonQuery.map((query) => {
						const track = menuLists.find((track) => track.id === query)!;
						return (
							<TrackTag
								key={track.id}
								tag={track}
								onClick={() => handleTagDelete(track.id)}
							/>
						);
					})}
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
					"absolute max-h-96 w-full overflow-auto rounded-md bg-zinc-900 opacity-0 transition ease-in-out scrollbar-hidden",
					{
						"translate-y-3 opacity-100": isOpen,
						"pointer-events-none": !isOpen,
					}
				)}
			>
				{parentLists && (
					<div className="sticky top-0 flex gap-2 overflow-auto bg-zinc-900/90 px-3 py-6">
						{parentLists.map((listItem) => (
							<AlbumTag
								key={listItem.id}
								tag={listItem}
								onClick={() => handleAlbumFilter(listItem.id)}
								selectedAlbumId={filteredParentId}
							/>
						))}
					</div>
				)}
				{menuLists
					.filter((listItem) => {
						if (filteredParentId) return listItem.parentId === filteredParentId;
						else return listItem;
					})
					.map((track) => (
						<MenuItem
							key={track.id}
							tag={track}
							onClick={() => handleMenuItemClick(track.id)}
						/>
					))}
			</div>
		</div>
	);
}

function TrackTag({
	tag,
	isDefault = false,
	onClick,
}: {
	tag: MenuList;
	isDefault?: boolean;
	onClick?: () => void;
}) {
	return (
		<div
			className="flex flex-none flex-grow-0 items-center gap-1 rounded px-3 py-2 text-zinc-100"
			style={{
				backgroundColor: ensureBrightness(tag.color ?? DEFAULT_COLOR) + "90",
			}}
		>
			{!isDefault && (
				<div
					onClick={(e) => {
						e.stopPropagation();
						if (onClick) onClick();
					}}
					className="-ml-1"
				>
					<Cross2Icon />
				</div>
			)}
			{tag.name}
		</div>
	);
}

function AlbumTag({
	tag,
	selectedAlbumId,
	onClick,
}: {
	tag: ParentList;
	selectedAlbumId: string | null;
	onClick: () => void;
}) {
	return (
		<div
			className={cn(
				"flex flex-none flex-grow-0 items-center gap-2 rounded-full px-4 py-2 text-zinc-100",
				{
					"bg-zinc-750": selectedAlbumId !== tag.id,
				}
			)}
			style={
				selectedAlbumId === tag.id
					? {
							backgroundColor: (tag.color ?? DEFAULT_COLOR) + "90",
						}
					: undefined
			}
			onClick={onClick}
		>
			{tag.name}
		</div>
	);
}

function MenuItem({ tag, onClick }: { tag: MenuList; onClick: () => void }) {
	return (
		<div
			key={tag.id}
			className="rounded-md px-4 py-3 text-zinc-500 hover:bg-zinc-850 hover:text-zinc-100"
			onClick={onClick}
		>
			{tag.name}
		</div>
	);
}
