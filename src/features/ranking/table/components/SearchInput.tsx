import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type SearchInputProps = {
	globalFilter: string;
	setGlobalFilter: (value: string) => void;
};

export default function SearchInput({
	globalFilter,
	setGlobalFilter,
}: SearchInputProps) {

	return (
		<div className="relative max-w-sm flex-1">
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-secondary-foreground" />
			<Input
				placeholder="Search tracks..."
				value={globalFilter}
				onChange={(e) => setGlobalFilter(e.target.value)}
				className="h-8 bg-secondary focus-visible:ring-0 border-transparent pl-10 pr-10"
			/>
			{globalFilter && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setGlobalFilter("")}
					className="absolute right-2 top-1/2 -translate-y-1/2 transform p-0 [&_svg]:size-3.5"
				>
					<X />
				</Button>
			)}
		</div>
	);
}
