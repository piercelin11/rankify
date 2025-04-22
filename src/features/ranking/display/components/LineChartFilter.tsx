"use client";

import { DEFAULT_COLOR } from "@/config/variables";
import { cn } from "@/lib/cn";
import { ensureBrightness } from "@/lib/utils/adjustColor";
import { ChevronDownIcon, Cross2Icon } from "@radix-ui/react-icons";
import useLineChartFilter from "../hooks/useLineChartFilter";

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
				className="flex justify-between gap-3 rounded-md bg-neutral-900 p-3"
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
					className={cn("self-center text-neutral-400 transition ease-in-out", {
						"rotate-180 transform text-neutral-600": isOpen,
					})}
					width={18}
					height={18}
				/>
			</div>
			<div
				className={cn(
					"absolute max-h-96 w-full overflow-auto rounded-md bg-neutral-900 opacity-0 transition ease-in-out scrollbar-hidden",
					{
						"translate-y-3 opacity-100": isOpen,
						"pointer-events-none": !isOpen,
					}
				)}
			>
				{parentOptions && (
					<div className="sticky top-0 flex gap-2 overflow-auto bg-neutral-900/90 px-3 py-6 scrollbar-hidden">
						{parentOptions.map((listItem) => (
							<AlbumTag
								key={listItem.id}
								tag={listItem}
								onClick={() => handleAlbumFilter(listItem.id)}
								selectedAlbumId={filteredParentId}
							/>
						))}
					</div>
				)}
				{filteredMenuOptions.map((listItem) => (
						<MenuItem
							key={listItem.id}
							tag={listItem}
							onClick={() => handleMenuItemClick(listItem.id)}
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
	tag: MenuOptionType;
	isDefault?: boolean;
	onClick?: () => void;
}) {
	return (
		<div
			className="flex flex-none flex-grow-0 items-center gap-1 rounded px-2 py-1 text-neutral-100 sm:px-3 sm:py-2"
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
	tag: ParentOptionType;
	selectedAlbumId: string | null;
	onClick: () => void;
}) {
	return (
		<div
			className={cn(
				"flex flex-none flex-grow-0 items-center gap-2 rounded-full px-4 py-2 text-neutral-100",
				{
					"bg-neutral-750": selectedAlbumId !== tag.id,
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

function MenuItem({
	tag,
	onClick,
}: {
	tag: MenuOptionType;
	onClick: () => void;
}) {
	return (
		<div
			key={tag.id}
			className="rounded-md px-4 py-3 text-neutral-500 hover:bg-neutral-850 hover:text-neutral-100"
			onClick={onClick}
		>
			{tag.name}
		</div>
	);
}
