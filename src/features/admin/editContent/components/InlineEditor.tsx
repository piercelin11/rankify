"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { useInlineEdit } from "../hooks/useInlineEdit";
import { useInlineSelect } from "../hooks/useInlineSelect";

type InlineEditCellProps = {
	value: string;
	onSave: (value: string) => void;
	className?: string;
}

export function InlineEditCell({
	value,
	onSave,
	className,
}: InlineEditCellProps) {
	const {
		isEditing,
		editValue,
		setEditValue,
		startEdit,
		cancelEdit,
		saveEdit,
	} = useInlineEdit(value);

	const handleSave = () => saveEdit(onSave);

	if (isEditing) {
		return (
			<Input
				value={editValue}
				onChange={(e) => setEditValue(e.target.value)}
				onBlur={handleSave}
				onKeyDown={(e) => {
					if (e.key === "Enter") handleSave();
					if (e.key === "Escape") cancelEdit();
				}}
				className={cn("h-8 w-full border-muted", className)}
				autoFocus
			/>
		);
	}

	return (
		<div
			className={cn(
				"flex h-8 w-full cursor-pointer items-center rounded px-2 py-1 hover:bg-neutral-800/50",
				className
			)}
			onClick={startEdit}
		>
			{value || "Click to edit"}
		</div>
	);
}

type InlineSelectCellProps = {
	value: string;
	onSave: (value: string) => void;
	options: { value: string; label: string }[];
}

export function InlineSelectCell({
	value,
	onSave,
	options,
}: InlineSelectCellProps) {
	const { isEditing, setIsEditing, startEdit, selectValue } = useInlineSelect();

	if (isEditing) {
		return (
			<Select
				value={value}
				onValueChange={(newValue) => selectValue(newValue, onSave)}
				open={isEditing}
				onOpenChange={setIsEditing}
			>
				<SelectTrigger className="h-8 border-muted">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}

	return (
		<div
			className="flex mr-4 h-8 w-full cursor-pointer items-center rounded px-2 py-1 hover:bg-neutral-800/50"
			onClick={startEdit}
		>
			<Badge variant="outline" className="text-xs">
				{options.find((o) => o.value === value)?.label || value}
			</Badge>
		</div>
	);
}