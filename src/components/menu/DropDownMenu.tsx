"use client";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React, { useState } from "react";
import { menuItemProps } from "./NavigationTabs";

type DropDownMenuProps = {
	menuData: menuItemProps[];
	placeholder?: string;
};

export default function DropDownMenu({
	menuData,
	placeholder,
}: DropDownMenuProps) {
	const [isOpen, setOPen] = useState(false);

	return (
		<div className="relative select-none">
			<div
				className="flex justify-between rounded-md bg-zinc-900 px-4 py-3 hover:outline hover:outline-1 hover:outline-zinc-700"
				onClick={() => setOPen((prev) => !prev)}
			>
				<div
					className={cn("min-w-52 text-zinc-600", {
						"text-zinc-100": isOpen,
					})}
				>
					{placeholder || "Select..."}
				</div>
				<ChevronDownIcon
					className={cn("self-center text-zinc-400 transition ease-in-out", {
						"rotate-180 transform text-zinc-600": isOpen,
					})}
					width={18}
					height={18}
				/>
			</div>
			<div
				className={cn(
					"absolute w-full rounded-md bg-zinc-900 opacity-0 transition ease-in-out",
					{
						"translate-y-3 opacity-100": isOpen,
						"pointer-events-none": !isOpen,
					}
				)}
			>
				{menuData.map((menuItem) => (
					<Link key={menuItem.link} href={menuItem.link} onClick={() => setOPen(false)} replace>
						<div className="hover:bg-zinc-850 rounded-md px-4 py-3 text-zinc-500 hover:text-zinc-100">
							{menuItem.label}
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
