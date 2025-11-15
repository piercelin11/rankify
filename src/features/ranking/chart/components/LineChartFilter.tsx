"use client";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import useLineChartFilter from "../hooks/useLineChartFilter";
import TrackTag from "./TrackTag";
import AlbumFilterButton from "./AlbumFilterButton";
import VirtualizedMenuItems from "./VirtualizedMenuItems";
import type { MenuOptionType, ParentOptionType, ComparisonData } from "../types";

type LineChartFilterProps = {
	defaultTag: MenuOptionType;
	menuOptions: MenuOptionType[];
	parentOptions?: ParentOptionType[];
	onLoadComparisonData?: (ids: string[]) => Promise<ComparisonData[]>;
	onComparisonDataChange?: (data: ComparisonData[]) => void;
};

export default function LineChartFilter({
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
	} = useLineChartFilter(defaultTag, onLoadComparisonData);

	// 簡單計算，不使用 useMemo
	const menuOptionMap = new Map(
		menuOptions.map((option) => [option.id, option])
	);
	const comparisonQuerySet = new Set(comparisonQuery);
	const filteredMenuOptions = filteredParentId
		? menuOptions.filter((option) => option.parentId === filteredParentId)
		: menuOptions;
	const selectedCount = comparisonQuery.length;

	// 當比較資料變更時，通知父組件
	useEffect(() => {
		if (onComparisonDataChange) {
			onComparisonDataChange(comparisonData);
		}
	}, [comparisonData, onComparisonDataChange]);

	return (
		<DropdownMenu open={isOpen} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<div className="flex cursor-pointer items-center gap-3   pb-2 focus:outline-none">
					<div className="flex flex-1 items-center gap-1">
						{selectedCount === 0 ? (
							<>
								<TrackTag tag={defaultTag} isDefault />
								<span className="select-none text-sm text-muted-foreground">
									+ Compare
								</span>
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
										<Badge variant="secondary" className="text-sm font-normal text-nowrap">
											+{selectedCount - 2} more
										</Badge>
									)}
								</div>
							</>
						)}
					</div>
					<ChevronDownIcon
						className={cn(
							"h-4 w-4 text-secondary-foreground transition-transform",
							isOpen && "rotate-180"
						)}
					/>
				</div>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				className="mt-1 max-h-[450px] w-[450px] overflow-y-auto flex flex-col rounded-lg p-3"
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
									className="text-sm text-primary-500 hover:text-foreground"
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

				{/* 歌曲選項區 - 虛擬化 */}
				<VirtualizedMenuItems
					options={filteredMenuOptions}
					comparisonQuerySet={comparisonQuerySet}
					loadingIds={loadingIds}
					defaultTagId={defaultTag.id}
					onMenuItemClick={handleMenuItemClick}
				/>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
