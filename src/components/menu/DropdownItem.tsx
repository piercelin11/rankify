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
				"text-label w-full rounded-md px-4 py-2 text-left text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100",
				className
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
