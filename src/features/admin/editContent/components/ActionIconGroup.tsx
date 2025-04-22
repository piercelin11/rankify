"use client";

import React from "react";
import { Pencil1Icon, TrashIcon, UpdateIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/cn";

const svgAttributes = {
	className: "text-neutral-400 hover:text-neutral-100",
	width: 25,
	height: 25,
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
		<div className={cn("flex gap-6", className)}>
			{onUpdateClick && (
				<UpdateIcon {...svgAttributes} onClick={onUpdateClick} />
			)}
			{onEditClick && <Pencil1Icon {...svgAttributes} onClick={onEditClick} />}
			{onDeleteClick && (
				<TrashIcon {...svgAttributes} onClick={onDeleteClick} />
			)}
		</div>
	);
}
