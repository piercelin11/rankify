"use client";
import { DEFAULT_COLOR } from "@/config/variables";
import { cn } from "@/lib/cn";
import { ensureBrightness } from "@/lib/utils/adjustColor";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export type TabItemProps = {
	label: string;
	id: string;
	link?: string;
	onClick?: () => void;
};

type NavigationTabsProps = {
	menuData: TabItemProps[];
	activeId?: string;
	color?: string | null;
};

export default function Tabs({
	menuData,
	activeId,
	color,
}: NavigationTabsProps) {
	const pathname = usePathname();
	return (
		<div className="flex w-max select-none rounded-lg border border-zinc-800">
			{menuData.map((menuItem) => (
				<TabItem
					key={menuItem.id}
					itemData={menuItem}
					isActive={
						menuItem.link
							? menuItem.link === pathname
							: menuItem.id === activeId
					}
					color={color}
				/>
			))}
		</div>
	);
}

function TabItem({
	itemData,
	color,
	isActive,
}: {
	itemData: TabItemProps;
	color?: string | null;
	isActive: boolean;
}) {
	const activeColor = color ? ensureBrightness(color) : DEFAULT_COLOR;

	return itemData.link ? (
		<Link
			href={itemData.link}
			className={isActive ? "pointer-events-none" : ""}
		>
			<div
				className={cn(
					"justify-self-center rounded-lg px-4 py-3 text-zinc-600",
					{
						"text-zinc-950": isActive,
					}
				)}
				style={{
					backgroundColor: isActive ? activeColor : "#09090b",
				}}
			>
				{itemData.label}
			</div>
		</Link>
	) : (
		<div
			className={cn(
				"justify-self-center rounded-lg px-4 py-3 text-lg text-zinc-600",
				{
					"text-zinc-950": isActive,
				}
			)}
			style={{
				backgroundColor: isActive ? activeColor : "#09090b",
			}}
			onClick={itemData.onClick}
		>
			{itemData.label}
		</div>
	);
}
