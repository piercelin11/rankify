import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { MenuOptionType } from "../types";

type VirtualizedMenuItemsProps = {
	options: MenuOptionType[];
	comparisonQuerySet: Set<string>;
	loadingIds: Set<string>;
	defaultTagId: string;
	onMenuItemClick: (id: string) => void;
};

export default function VirtualizedMenuItems({
	options,
	comparisonQuerySet,
	loadingIds,
	defaultTagId,
	onMenuItemClick,
}: VirtualizedMenuItemsProps) {
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: options.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 40, // Radix DropdownMenuItem 的估計高度
		overscan: 5, // 多渲染一些項目以平滑滾動
	});

	if (options.length === 0) {
		return (
			<div className="py-4 text-center text-sm text-neutral-500">
				No tracks found
			</div>
		);
	}

	return (
		<div
			ref={parentRef}
			className="max-h-[240px] overflow-y-auto"
		>
			<div
				style={{
					height: `${virtualizer.getTotalSize()}px`,
					width: '100%',
					position: 'relative',
				}}
			>
				{virtualizer.getVirtualItems().map((virtualItem) => {
					const option = options[virtualItem.index];
					const isLoading = loadingIds.has(option.id);
					const isSelected = comparisonQuerySet.has(option.id);
					const isDefault = option.id === defaultTagId;
					const isDisabled = isSelected || isDefault || isLoading;

					return (
						<DropdownMenuItem
							key={virtualItem.key}
							onClick={() => {
								if (!isDisabled) {
									onMenuItemClick(option.id);
								}
							}}
							disabled={isDisabled}
							className="flex items-center justify-between rounded-md"
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								height: `${virtualItem.size}px`,
								transform: `translateY(${virtualItem.start}px)`,
								boxSizing: 'border-box',
							}}
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
				})}
			</div>
		</div>
	);
}