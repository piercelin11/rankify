import { cn } from "@/lib/cn";
import React, { HTMLAttributes } from "react";

type DropdownContentProps = {
	isDropdownOpen: boolean;
	children: React.ReactNode;
	className?: HTMLAttributes<HTMLDivElement>["className"];
};

export default function DropdownContent({
	isDropdownOpen,
	children,
	className,
}: DropdownContentProps) {
	return (
		<div
			className={cn(
				"absolute z-50 max-h-96 w-full overflow-y-scroll overscroll-contain rounded-xl border border-neutral-700 bg-neutral-950 opacity-0 transition ease-in-out scrollbar-hidden",
				className,
				{
					"translate-y-3 opacity-100": isDropdownOpen,
					"pointer-events-none": !isDropdownOpen,
				}
			)}
		>
			{children}
		</div>
	);
}
