import { cn } from "@/lib/cn";
import React from "react";

type DropdownContentProps = {
	isDropdownOpen: boolean;
	children: React.ReactNode;
};

export default function DropdownContent({
	isDropdownOpen,
	children,
}: DropdownContentProps) {
	return (
		<div
			className={cn(
				"absolute max-h-96 w-full overflow-y-scroll overscroll-contain rounded-xl border border-neutral-700 bg-neutral-950 opacity-0 z-50 transition ease-in-out scrollbar-hidden",
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
