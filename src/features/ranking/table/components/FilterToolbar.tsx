import { useState } from "react";
import { Funnel, FunnelPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { AdvancedFilters } from "../types";
import SearchInput from "./SearchInput";
import { Separator } from "@/components/ui/separator";

type FilterToolbarProps = {
	globalFilter: string;
	onGlobalFilterChange: (value: string) => void;
	filters?: AdvancedFilters;
	onFiltersChange?: (filters: AdvancedFilters) => void;
	availableAlbums?: string[]; // 可選的專輯列表
};

export default function FilterToolbar({
	globalFilter,
	onGlobalFilterChange,
	filters = {},
	onFiltersChange,
	availableAlbums = [],
}: FilterToolbarProps) {
	const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);

	// 計算活動過濾器數量
	const activeFilterCount = filters.albums?.length || 0;

	// 處理專輯過濾器變更
	const handleAlbumToggle = (albumName: string) => {
		const currentAlbums = localFilters.albums || [];
		const newAlbums = currentAlbums.includes(albumName)
			? currentAlbums.filter((name) => name !== albumName)
			: [...currentAlbums, albumName];

		const newFilters = { ...localFilters, albums: newAlbums };
		setLocalFilters(newFilters);
		onFiltersChange?.(newFilters);
	};

	const clearFilters = () => {
		const newFilters = { albums: [] };
		setLocalFilters(newFilters);
		onFiltersChange?.(newFilters);
	};

	return (
		<div className="flex items-center gap-2">
			{/* Global Search */}
			<SearchInput
				globalFilter={globalFilter}
				setGlobalFilter={onGlobalFilterChange}
			/>

			{/* Album Filters */}
			{availableAlbums.length > 0 && (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant={activeFilterCount ? "selected" : "secondary"}
							size="sm"
							className="gap-1 px-2"
						>
							{activeFilterCount > 0 ? <FunnelPlus /> : <Funnel />}
							{activeFilterCount > 0 && (
								<span className="text-base"> {activeFilterCount}</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-72" align="start">
						<div className="space-y-4">
							{/* Header */}
							<div className="flex items-center justify-between">
								<h4 className="text-md font-semibold">Filter by Albums</h4>
								<Button
									variant="ghost"
									onClick={clearFilters}
									className="h-6 px-2 text-sm text-secondary-foreground"
								>
									Clear All
								</Button>
							</div>
							<Separator />

							{/* Album List */}
							<div className="max-h-64 space-y-2 overflow-auto pr-4 scrollbar-hidden">
								{availableAlbums.map((albumName) => (
									<div
										key={albumName}
										className="flex items-center space-x-2 py-1"
									>
										<Checkbox
											id={albumName}
											checked={
												localFilters.albums?.includes(albumName) || false
											}
											onCheckedChange={() => handleAlbumToggle(albumName)}
										/>
										<label
											htmlFor={albumName}
											className="flex-1 cursor-pointer select-none overflow-hidden text-ellipsis text-nowrap text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{albumName}
										</label>
									</div>
								))}
							</div>
						</div>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}
