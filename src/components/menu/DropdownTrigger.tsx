"use client";

import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";

type DropdownTriggerProps = {
	children: React.ReactNode;
	toggleDropdown: () => void;
	isDropdownOpen: boolean;
};

export default function DropdownTrigger({
	children,
	toggleDropdown,
	isDropdownOpen,
}: DropdownTriggerProps) {
	return (
		<div
			className={cn(
				"group flex justify-between gap-3 text-neutral-400 rounded-xl border border-neutral-700 bg-neutral-950 p-3 hover:border-neutral-600",
				{
					"border-neutral-600": isDropdownOpen,
				}
			)}
			onClick={toggleDropdown}
		>
			{children}
			<ChevronDownIcon
				className={cn(
					"self-center text-neutral-500 transition ease-in-out group-hover:text-neutral-400",
					{
						"rotate-180 transform text-neutral-400": isDropdownOpen,
					}
				)}
				width={18}
				height={18}
			/>
		</div>
	);
}
