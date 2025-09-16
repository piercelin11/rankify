import { Input } from "@/components/ui/input";
import type { RankingTableFeatures } from "../types";

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
		<div className="flex items-center space-x-2">
			<Input
				placeholder={
					typeof features.search === "object" && features.search.placeholder
						? features.search.placeholder
						: "Search tracks..."
				}
				value={globalFilter ?? ""}
				onChange={(event) => setGlobalFilter(String(event.target.value))}
				className="max-w-sm"
			/>
		</div>
	);
}