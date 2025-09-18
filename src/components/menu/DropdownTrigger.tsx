"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import React, { HTMLAttributes } from "react";

type DropdownTriggerProps = {
	children: React.ReactNode;
	toggleDropdown: () => void;
	isDropdownOpen: boolean;
	hasIcon?: boolean;
	className?: HTMLAttributes<HTMLDivElement>["className"];
};

export default function DropdownTrigger({
	children,
	toggleDropdown,
	isDropdownOpen,
	className,
	hasIcon = true,
}: DropdownTriggerProps) {
	return (
		<>
			<div
				className={cn(
					"group flex cursor-pointer items-center justify-between gap-3 rounded-xl border  bg-neutral-950 p-3 text-secondary-foreground hover:",
					className,
					{
						"": isDropdownOpen,
					}
				)}
				onClick={toggleDropdown}
			>
				{children}
				{hasIcon && (
					<ChevronDownIcon
						className={cn(
							"me-2 self-center text-muted-foreground transition ease-in-out group-hover:text-secondary-foreground",
							{
								"rotate-180 transform text-secondary-foreground": isDropdownOpen,
							}
						)}
						width={18}
						height={18}
					/>
				)}
			</div>
			{isDropdownOpen && (
				<div
					onClick={toggleDropdown}
					className="fixed left-0 top-0 z-10 h-screen w-screen"
				/>
			)}
		</>
	);
}
