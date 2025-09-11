"use client";

import { SCROLL_SESSION_KEY } from "@/features/ranking/display/hooks/useListScroll";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";
import React from "react";
import Tooltip from "@/components/overlay/Tooltip";

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

	function handleClick() {
		if (sessionStorage.getItem(SCROLL_SESSION_KEY))
			sessionStorage.removeItem(SCROLL_SESSION_KEY);
		if (onClick) onClick();
	}

	if (href)
		return (
			<Link className="cursor-pointer" href={href} onClick={handleClick}>
				<div
					className={cn(buttonStyle, {
						"hover:bg-neutral-950": !isSidebarOpen,
					})}
				>
					<Tooltip
						className={cn({
							hidden: isSidebarOpen,
						})}
						content={label}
						position="right"
					>
						{icon()}
					</Tooltip>
					<p className="overflow-hidden text-ellipsis">{label}</p>
				</div>
			</Link>
		);

	return (
		<div
			className={cn(buttonStyle, {
				"hover:bg-neutral-950": !isSidebarOpen,
			})}
			onClick={handleClick}
		>
			<Tooltip
				className={cn({
					hidden: isSidebarOpen,
				})}
				content={label}
				position="right"
			>
				{icon()}
			</Tooltip>
			<p className="overflow-hidden text-ellipsis">{label}</p>
		</div>
	);
}
