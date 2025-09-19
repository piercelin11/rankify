import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { AdvancedFilters } from "../types";
import SearchInput from "../../components/SearchInput";

type FilterToolbarProps = {
	globalFilter: string;
	onGlobalFilterChange: (value: string) => void;
	filters?: AdvancedFilters;
	onFiltersChange?: (filters: AdvancedFilters) => void;
	showAdvancedFilters?: boolean;
	availableAlbums?: string[]; // 可選的專輯列表
};

export default function FilterToolbar({
	globalFilter,
	onGlobalFilterChange,
	filters = {},
	onFiltersChange,
	showAdvancedFilters = true,
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
		<div className="flex items-center gap-4">
			{/* Global Search */}
			<SearchInput
				globalFilter={globalFilter}
				setGlobalFilter={onGlobalFilterChange}
				features={{
					search: true,
				}}
			/>

			{/* Album Filters */}
			{showAdvancedFilters && availableAlbums.length > 0 && (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							size="lg"
							className="items-center gap-2 px-4"
						>
							<Filter className="h-4 w-4" />
							Albums
							{activeFilterCount > 0 && (
								<Badge variant="secondary" className="px-2">
									{activeFilterCount}
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-72" align="start">
						<div className="space-y-6">
							{/* Header */}
							<div className="flex items-center justify-between">
								<h4 className="font-semibold">Filter by Albums</h4>
								<Button
									variant="ghost"
									onClick={clearFilters}
									className="h-6 px-2 text-sm text-primary-500"
								>
									Clear All
								</Button>
							</div>

							{/* Album List */}
							<div className="max-h-64 space-y-3 overflow-auto pr-4 scrollbar-hidden">
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
											className="flex-1 cursor-pointer select-none overflow-hidden text-ellipsis text-nowrap leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
