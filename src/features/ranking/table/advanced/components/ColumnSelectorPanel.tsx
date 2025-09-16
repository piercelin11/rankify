import { Settings, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { ColumnVisibility } from "../types";

type ColumnOption = {
	key: keyof ColumnVisibility;
	label: string;
	visible: boolean;
};

type ColumnSelectorPanelProps = {
	columnOptions: ColumnOption[];
	visibleCount: number;
	onToggleColumn: (columnKey: keyof ColumnVisibility) => void;
	onSetAllColumns: (visible: boolean) => void;
	onResetColumns: () => void;
};

export default function ColumnSelectorPanel({
	columnOptions,
	visibleCount,
	onToggleColumn,
	onSetAllColumns,
	onResetColumns,
}: ColumnSelectorPanelProps) {
	const totalColumns = columnOptions.length;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="lg" className="gap-2 px-4">
					<Settings className="h-4 w-4" />
					Columns
					<Badge variant="secondary" className="px-2">
						{visibleCount}
					</Badge>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-72" align="end">
				<div className="space-y-3">
					{/* Header */}
					<div className="flex items-center justify-between">
						<h4 className="font-semibold">Toggle Columns</h4>
						<Button
							variant="ghost"
							onClick={onResetColumns}
							className="h-6 px-2 text-sm text-primary-500"
						>
							Reset
						</Button>
					</div>

					{/* Select All Controls */}
					<div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => onSetAllColumns(true)}
							>
								<Eye className="h-3 w-3" />
								All
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onSetAllColumns(false)}
							>
								<EyeOff className="h-3 w-3" />
								None
							</Button>
						</div>
					</div>

					<Separator />

					{/* Column List */}
					<div className="max-h-64 space-y-2 overflow-auto pr-2 scrollbar-hidden">
						{columnOptions.map((column) => (
							<div
								key={column.key}
								className="flex items-center space-x-2 py-1"
							>
								<Checkbox
									id={column.key}
									checked={column.visible}
									onCheckedChange={() => onToggleColumn(column.key)}
								/>
								<label
									htmlFor={column.key}
									className="flex-1 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{column.label}
								</label>
							</div>
						))}
					</div>

					{/* Footer */}
					<Separator />
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>
							{visibleCount} of {totalColumns} columns visible
						</span>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
