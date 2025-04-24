"use client";

import { DEFAULT_COLOR } from "@/config/variables";
import { cn } from "@/lib/cn";
import { adjustColorLightness } from "@/lib/utils/colorAdjustment";
import { ChevronDownIcon, Cross2Icon } from "@radix-ui/react-icons";
import useLineChartFilter from "../hooks/useLineChartFilter";
import { useState } from "react";

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
		setOPen,
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
		<div className="relative w-full select-none sm:w-[580px]">
			<div
				className={cn(
					"group flex justify-between gap-3 rounded-xl border border-neutral-700 bg-neutral-950 p-3 hover:border-neutral-600",
					{
						"border-neutral-600": isOpen,
					}
				)}
				onClick={() => setOPen((prev) => !prev)}
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
				<ChevronDownIcon
					className={cn(
						"self-center text-neutral-500 transition ease-in-out group-hover:text-neutral-400",
						{
							"rotate-180 transform text-neutral-400": isOpen,
						}
					)}
					width={18}
					height={18}
				/>
			</div>
			<div
				className={cn(
					"absolute max-h-96 w-full overflow-auto overscroll-contain rounded-xl border border-neutral-700 bg-neutral-950 opacity-0 transition ease-in-out scrollbar-hidden",
					{
						"translate-y-3 opacity-100": isOpen,
						"pointer-events-none": !isOpen,
					}
				)}
			>
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
						<MenuItem
							key={listItem.id}
							tag={listItem}
							onClick={() => handleMenuItemClick(listItem.id)}
						/>
					))}
				</div>
			</div>
		</div>
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
				backgroundColor: adjustColorLightness(
					tag.color ?? DEFAULT_COLOR,
					isCrossHover ? 0.1 : 0.05
				),
				border: `solid 1px ${adjustColorLightness(tag.color ?? DEFAULT_COLOR, 0.7, 1.5)}`,
				color: adjustColorLightness(tag.color ?? DEFAULT_COLOR, 0.8, 1.5),
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
				"text-label text-nowrap items-center gap-2 rounded-full px-4 py-2 text-neutral-100",
				{
					"bg-neutral-800": selectedAlbumId !== tag.id,
				}
			)}
			style={{
				backgroundColor: adjustColorLightness(
					tag.color ?? DEFAULT_COLOR,
					isHighlight ? 0.1 : 0
				),
				border: `solid 1px ${adjustColorLightness(tag.color ?? DEFAULT_COLOR, isHighlight ? 0.7 : 0.4, 1.5)}`,
				color: adjustColorLightness(
					tag.color ?? DEFAULT_COLOR,
					isHighlight ? 0.8 : 0.5,
					1.5
				),
			}}
			onMouseEnter={() => setCrossHover(true)}
			onMouseLeave={() => setCrossHover(false)}
			onClick={onClick}
		>
			{tag.name}
		</button>
	);
}

function MenuItem({
	tag,
	onClick,
}: {
	tag: MenuOptionType;
	onClick: () => void;
}) {
	return (
		<button
			key={tag.id}
			className="text-label w-full text-left rounded-md px-4 py-2 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
			onClick={onClick}
		>
			{tag.name}
		</button>
	);
}
