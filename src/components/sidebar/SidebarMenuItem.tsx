"use client";

import { SCROLL_SESSION_KEY } from "@/features/ranking/display/hooks/useListScroll";
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
		"flex w-full h-12 items-center gap-4 overflow-hidden text-nowrap rounded-xl py-2 px-6 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100";

	function handleLinkClick() {
		sessionStorage.removeItem(SCROLL_SESSION_KEY);
		if (onClick) onClick();
	}
	if (href)
		return (
			<Link className="cursor-pointer" href={href} onClick={handleLinkClick}>
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
			onClick={handleLinkClick}
		>
			<div>{icon()}</div>
			<p className="overflow-hidden text-ellipsis">{label}</p>
		</button>
	);
}
