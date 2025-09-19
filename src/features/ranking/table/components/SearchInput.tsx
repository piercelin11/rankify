import { Input } from "@/components/ui/input";
import type { RankingTableFeatures } from "../types";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type SearchInputProps = {
	globalFilter: string;
	setGlobalFilter: (value: string) => void;
	features: RankingTableFeatures;
};

export default function SearchInput({
	globalFilter,
	setGlobalFilter,
	features,
}: SearchInputProps) {
	if (!features.search) return null;

	return (
		<div className="relative max-w-sm flex-1">
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
			<Input
				placeholder="Search tracks..."
				value={globalFilter}
				onChange={(e) => setGlobalFilter(e.target.value)}
				className="bg-field h-10 pl-10 pr-10"
			/>
			{globalFilter && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setGlobalFilter("")}
					className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 transform p-0"
				>
					<X className="h-2 w-2" />
				</Button>
			)}
		</div>
	);
}
