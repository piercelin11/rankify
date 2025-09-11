"use client";

import { DEFAULT_COLOR } from "@/constants";
import { cn } from "@/lib/utils";
import { adjustColor } from "@/lib/utils/color.utils";
import { Cross2Icon } from "@radix-ui/react-icons";
import useLineChartFilter from "../hooks/useLineChartFilter";
import { useState } from "react";
import DropdownContainer from "@/components/menu/DropdownContainer";
import DropdownTrigger from "@/components/menu/DropdownTrigger";
import DropdownContent from "@/components/menu/DropdownContent";
import DropdownItem from "@/components/menu/DropdownItem";

export type ParentOptionType = {
	id: string;
	color: string | null;
	name: string;
};

export type MenuOptionType = ParentOptionType & {
	parentId?: string | null;
};

type LineChartFilterProps = {
	defaultTag: MenuOptionType;
	menuOptions: MenuOptionType[];
	parentOptions?: ParentOptionType[];
};

export default function LineChartFilter({
	defaultTag,
	menuOptions,
	parentOptions,
}: LineChartFilterProps) {
	const {
		setOpen,
		isOpen,
		comparisonQuery,
		filteredParentId,
		handleAlbumFilter,
		handleMenuItemClick,
		handleTagDelete,
	} = useLineChartFilter(defaultTag);

	const menuOptionMap = new Map(
		menuOptions.map((option) => [option.id, option])
	);
	const filteredMenuOptions = filteredParentId
		? menuOptions.filter((option) => option.parentId === filteredParentId)
		: menuOptions;

	return (
		<DropdownContainer width={580}>
			<DropdownTrigger
				toggleDropdown={() => setOpen((prev) => !prev)}
				isDropdownOpen={isOpen}
			>
				<div className="flex gap-2 overflow-auto scrollbar-hidden">
					<TrackTag tag={defaultTag} isDefault={true} />
					{comparisonQuery.map((trackId) => {
						const trackTag = menuOptionMap.get(trackId);
						if (!trackTag) return;
						return (
							<TrackTag
								key={trackTag.id}
								tag={trackTag}
								onClick={() => handleTagDelete(trackTag.id)}
							/>
						);
					})}
				</div>
			</DropdownTrigger>
			<DropdownContent isDropdownOpen={isOpen}>
				{parentOptions && (
					<div className="sticky top-0 space-y-2 border-b border-neutral-900 bg-neutral-950 py-6">
						<p className="text-caption px-4">Album</p>

						<div className="flex gap-2 overflow-auto px-4 scrollbar-hidden">
							{parentOptions.map((listItem) => (
								<AlbumTag
									key={listItem.id}
									tag={listItem}
									onClick={() => handleAlbumFilter(listItem.id)}
									selectedAlbumId={filteredParentId}
								/>
							))}
						</div>
					</div>
				)}
				<div className="p-2">
					{filteredMenuOptions.map((listItem) => (
						<DropdownItem
							key={listItem.id}
							onClick={() => handleMenuItemClick(listItem.id)}
						>
							{listItem.name}
						</DropdownItem>
					))}
				</div>
			</DropdownContent>
		</DropdownContainer>
	);
}

function TrackTag({
	tag,
	isDefault = false,
	onClick,
}: {
	tag: MenuOptionType;
	isDefault?: boolean;
	onClick?: () => void;
}) {
	const [isCrossHover, setCrossHover] = useState(false);
	return (
		<div
			className="text-label flex flex-none flex-grow-0 items-center gap-1 rounded-lg px-2 py-1 sm:px-3 sm:py-2"
			style={{
				backgroundColor: adjustColor(
					tag.color ?? DEFAULT_COLOR,
					isCrossHover ? 0.1 : 0.05
				),
				border: `solid 1px ${adjustColor(tag.color ?? DEFAULT_COLOR, 0.7, 1.5)}`,
				color: adjustColor(tag.color ?? DEFAULT_COLOR, 0.8, 1.5),
			}}
		>
			{!isDefault && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						if (onClick) onClick();
					}}
					className="-ml-1"
					onMouseEnter={() => setCrossHover(true)}
					onMouseLeave={() => setCrossHover(false)}
				>
					<Cross2Icon />
				</button>
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
	tag: ParentOptionType;
	selectedAlbumId: string | null;
	onClick: () => void;
}) {
	const [isCrossHover, setCrossHover] = useState(false);
	const isHighlight = selectedAlbumId === tag.id || isCrossHover;
	return (
		<button
			className={cn(
				"items-center gap-2 text-nowrap rounded-full px-4 py-2 text-neutral-100",
				{
					"bg-neutral-800": selectedAlbumId !== tag.id,
				}
			)}
			style={{
				backgroundColor: adjustColor(
					tag.color ?? DEFAULT_COLOR,
					isHighlight ? 0.1 : 0
				),
				border: `solid 1px ${adjustColor(tag.color ?? DEFAULT_COLOR, isHighlight ? 0.7 : 0.4, 1.5)}`,
				color: adjustColor(
					tag.color ?? DEFAULT_COLOR,
					isHighlight ? 0.8 : 0.5,
					1.5
				),
			}}
			onMouseEnter={() => setCrossHover(true)}
			onMouseLeave={() => setCrossHover(false)}
			onClick={onClick}
		>
			<p className="text-label">{tag.name}</p>
		</button>
	);
}
