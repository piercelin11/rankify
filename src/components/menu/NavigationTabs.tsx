"use client";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export type menuItemProps = {
	label: string;
	link: string;
};

type NavigationTabsProps = {
	menuData: menuItemProps[];
};

export default function NavigationTabs({ menuData }: NavigationTabsProps) {
	const pathName = usePathname();

	return (
		<div className="flex rounded-lg border border-zinc-800">
			{menuData.map((menuitem) => (
				<div
					key={menuitem.link}
					className={cn(
						"justify-self-center rounded-lg px-4 py-3 text-zinc-600",
						{
							"bg-lime-500 text-zinc-950": pathName === menuitem.link,
						}
					)}
				>
					<Link href={menuitem.link}>{menuitem.label}</Link>
				</div>
			))}
		</div>
	);
}
