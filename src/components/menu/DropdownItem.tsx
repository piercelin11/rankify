import { cn } from "@/lib/utils";
import React, { HTMLAttributes, ReactNode } from "react";

type DropdownItemProps = {
	onClick?: () => void;
	children: string | ReactNode;
	className?: HTMLAttributes<HTMLDivElement>["className"];
};

export default function DropdownItem({
	children,
	onClick,
	className,
}: DropdownItemProps) {
	return (
		<button
			className={cn(
				" w-full rounded-md px-4 py-2 text-left text-secondary-foreground hover:bg-neutral-900 hover:text-foreground",
				className
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
