"use client";

import { cn } from "@/lib/cn";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";
import React from "react";

type SidebarMenuItemProps = {
	icon: () => React.ReactNode;
	href?: string;
	onClick?: () => void;
	label: string;
};

export default function SidebarMenuItem({
	icon,
	href,
	onClick,
	label,
}: SidebarMenuItemProps) {
	const isSidebarOpen = useAppSelector((state) => state.sidebar.isSidebarOpen);
	const buttonStyle =
		"flex w-full items-center gap-4 overflow-hidden text-nowrap rounded-xl py-2 px-6 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100";
	if (href)
		return (
			<Link className="cursor-pointer" href={href}>
				<button
					className={cn(buttonStyle, {
						"hover:bg-neutral-950": !isSidebarOpen,
					})}
				>
					<div>{icon()}</div>
					<p className="overflow-hidden text-ellipsis">{label}</p>
				</button>
			</Link>
		);

	return (
		<button
			className={cn(buttonStyle, {
				"hover:bg-neutral-950": !isSidebarOpen,
			})}
			onClick={onClick}
		>
			<div>{icon()}</div>
			<p className="overflow-hidden text-ellipsis">{label}</p>
		</button>
	);
}
