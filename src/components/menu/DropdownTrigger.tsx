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
					"group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-neutral-400 hover:border-neutral-500",
					className,
					{
						"border-neutral-600": isDropdownOpen,
					}
				)}
				onClick={toggleDropdown}
			>
				{children}
				{hasIcon && (
					<ChevronDownIcon
						className={cn(
							"me-2 self-center text-neutral-500 transition ease-in-out group-hover:text-neutral-400",
							{
								"rotate-180 transform text-neutral-400": isDropdownOpen,
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
