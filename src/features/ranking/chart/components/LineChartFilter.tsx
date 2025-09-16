"use client";

import { DEFAULT_COLOR } from "@/constants";
import { cn } from "@/lib/utils";
import { adjustColor } from "@/lib/utils/color.utils";
import { Cross2Icon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import useUnifiedLineChartFilter, {
	DynamicTrackData,
} from "../hooks/useLineChartFilter";

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
	onLoadComparisonData?: (trackIds: string[]) => Promise<DynamicTrackData[]>;
	onComparisonDataChange?: (data: DynamicTrackData[]) => void;
};

export function LineChartFilter({
	defaultTag,
	menuOptions,
	parentOptions,
	onLoadComparisonData,
	onComparisonDataChange,
}: LineChartFilterProps) {
	const {
		isOpen,
		setOpen,
		comparisonQuery,
		comparisonData,
		loadingIds,
		filteredParentId,
		handleAlbumFilter,
		handleMenuItemClick,
		handleTagDelete,
		handleClearAll,
	} = useUnifiedLineChartFilter(defaultTag, onLoadComparisonData);

	// 當比較資料變更時，通知父組件
	useEffect(() => {
		if (onComparisonDataChange) {
			onComparisonDataChange(comparisonData);
		}
	}, [comparisonData, onComparisonDataChange]);

	const menuOptionMap = new Map(
		menuOptions.map((option) => [option.id, option])
	);

	const filteredMenuOptions = filteredParentId
		? menuOptions.filter((option) => option.parentId === filteredParentId)
		: menuOptions;

	// 選中的標籤數量
	const selectedCount = comparisonQuery.length;

	return (
		<DropdownMenu open={isOpen} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<div className="flex min-w-[550px] cursor-pointer items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950/50 p-2.5 focus:border-neutral-700 focus:outline-none">
					<div className="flex flex-1 items-center gap-2">
						{selectedCount === 0 ? (
							<>
								<TrackTag tag={defaultTag} isDefault />
								<span className="text-sm text-neutral-500">+ Compare</span>
							</>
						) : (
							<>
								<TrackTag tag={defaultTag} isDefault />
								<div className="flex flex-1 items-center gap-1 overflow-hidden">
									{comparisonQuery.slice(0, 2).map((trackId) => {
										const trackTag = menuOptionMap.get(trackId);
										if (!trackTag) return null;
										return (
											<TrackTag
												key={trackTag.id}
												tag={trackTag}
												onRemove={() => handleTagDelete(trackTag.id)}
											/>
										);
									})}
									{selectedCount > 2 && (
										<Badge variant="secondary" className="text-sm font-normal">
											+{selectedCount - 2} more
										</Badge>
									)}
								</div>
							</>
						)}
					</div>
					<ChevronDownIcon
						className={cn(
							"h-4 w-4 text-neutral-500 transition-transform",
							isOpen && "rotate-180"
						)}
					/>
				</div>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				className="max-h-[450px] w-[550px] overflow-y-auto mt-1 p-3 rounded-lg"
				align="end"
			>
				{/* 專輯篩選區 */}
				{parentOptions && parentOptions.length > 0 && (
					<>
						<div className="mb-2 flex items-center justify-between">
							<DropdownMenuLabel className="text-lg font-semibold">
								Filter by Album
							</DropdownMenuLabel>
							{selectedCount > 0 && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleClearAll();
									}}
									className="text-sm text-primary-500 hover:text-neutral-100"
								>
									Clear all
								</button>
							)}
						</div>
						<div className="flex flex-wrap gap-2 px-2 pb-2">
							{parentOptions.map((album) => (
								<AlbumFilterButton
									key={album.id}
									album={album}
									isSelected={filteredParentId === album.id}
									onClick={() => handleAlbumFilter(album.id)}
								/>
							))}
						</div>
						<DropdownMenuSeparator />
					</>
				)}

				{/* 歌曲選項區 */}
				<div className="max-h-[240px] overflow-y-scroll">
					{filteredMenuOptions.length === 0 ? (
						<div className="py-4 text-center text-sm text-neutral-500">
							No tracks found
						</div>
					) : (
						filteredMenuOptions.map((option) => {
							const isLoading = loadingIds.has(option.id);
							const isSelected = comparisonQuery.includes(option.id);
							const isDefault = option.id === defaultTag.id;

							return (
								<DropdownMenuItem
									key={option.id}
									onClick={() => handleMenuItemClick(option.id)}
									disabled={isSelected || isDefault || isLoading}
									className="flex items-center justify-between rounded-md"
								>
									<span className="truncate text-sm">{option.name}</span>
									<div className="flex items-center gap-2">
										{isLoading && (
											<div className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
										)}
										{(isSelected || isDefault) && (
											<Badge variant="secondary" className="text-xs">
												{isDefault ? "Default" : "Selected"}
											</Badge>
										)}
									</div>
								</DropdownMenuItem>
							);
						})
					)}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// 改進的標籤組件
function TrackTag({
	tag,
	isDefault = false,
	onRemove,
	size = "default",
}: {
	tag: MenuOptionType;
	isDefault?: boolean;
	onRemove?: () => void;
	size?: "default" | "sm";
}) {
	const [isHovering, setIsHovering] = useState(false);

	return (
		<div
			className={cn(
				"flex flex-none items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
				size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
			)}
			style={{
				backgroundColor: adjustColor(
					tag.color ?? DEFAULT_COLOR,
					isHovering ? 0.15 : 0.08
				),
				border: `1px solid ${adjustColor(tag.color ?? DEFAULT_COLOR, 0.3)}`,
				color: adjustColor(tag.color ?? DEFAULT_COLOR, 0.9, 1.2),
			}}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
		>
			{!isDefault && onRemove && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					className="flex h-3 w-3 items-center justify-center rounded-full hover:bg-black/20 focus:outline-none focus:ring-1 focus:ring-white/30"
					aria-label={`Remove ${tag.name}`}
				>
					<Cross2Icon className="h-3 w-3" />
				</button>
			)}
			<span className="max-w-[120px] truncate">{tag.name}</span>
		</div>
	);
}

// 專輯篩選按鈕
function AlbumFilterButton({
	album,
	isSelected,
	onClick,
}: {
	album: ParentOptionType;
	isSelected: boolean;
	onClick: () => void;
}) {
	const [isHovering, setIsHovering] = useState(false);

	return (
		<button
			onClick={onClick}
			className="rounded-full px-2.5 py-1 text-sm font-medium transition-all"
			style={{
				backgroundColor: adjustColor(
					album.color ?? DEFAULT_COLOR,
					isSelected || isHovering ? 0.15 : 0.05
				),
				border: `1px solid ${adjustColor(
					album.color ?? DEFAULT_COLOR,
					isSelected ? 0.7 : 0.2
				)}`,
				color: adjustColor(
					album.color ?? DEFAULT_COLOR,
					isSelected || isHovering ? 1 : 0.6,
					1.2
				),
			}}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
		>
			{album.name}
		</button>
	);
}
