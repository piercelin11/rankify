"use client";

import React from "react";
import { Pencil1Icon, TrashIcon, UpdateIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/features/admin/ui/button";

const iconSize = {
	width: 18,
	height: 18,
};

type ActionIconGroupProps = {
	onUpdateClick?: () => void;
	onDeleteClick?: () => void;
	onEditClick?: () => void;
	className?: React.HTMLAttributes<HTMLDivElement>["className"];
};

export default function ActionIconGroup({
	onUpdateClick,
	onDeleteClick,
	onEditClick,
	className,
}: ActionIconGroupProps) {
	return (
		<div className={cn("flex gap-2", className)}>
			{onUpdateClick && (
				<Button
					variant="ghost"
					size="icon"
					onClick={onUpdateClick}
					className="h-9 w-9 text-muted-foreground hover:text-foreground"
				>
					<UpdateIcon {...iconSize} />
				</Button>
			)}
			{onEditClick && (
				<Button
					variant="ghost"
					size="icon"
					onClick={onEditClick}
					className="h-9 w-9 text-muted-foreground hover:text-foreground"
				>
					<Pencil1Icon {...iconSize} />
				</Button>
			)}
			{onDeleteClick && (
				<Button
					variant="ghost"
					size="icon"
					onClick={onDeleteClick}
					className="h-9 w-9 text-muted-foreground hover:text-destructive"
				>
					<TrashIcon {...iconSize} />
				</Button>
			)}
		</div>
	);
}
