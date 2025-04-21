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
	options: TabItemProps[];
	activeId?: string;
	color?: string | null;
};

export default function Tabs({
	options,
	activeId,
	color,
}: NavigationTabsProps) {
	const pathname = usePathname();
	return (
		<div className="flex w-max select-none rounded-lg border border-zinc-800">
			{options.map((option) => (
				<TabItem
					key={option.id}
					itemData={option}
					isActive={
						option.link
							? option.link === pathname
							: option.id === activeId
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

	if (itemData.link)
		return (
			<Link
				href={itemData.link}
				className={isActive ? "pointer-events-none" : ""}
			>
				<button
					className={cn(
						"justify-self-center h-full rounded-lg px-3 py-2 text-zinc-600 xl:px-4 xl:py-3 xl:text-lg",
						{
							"text-zinc-950": isActive,
						}
					)}
					style={{
						backgroundColor: isActive ? activeColor : "#09090b",
					}}
				>
					{itemData.label}
				</button>
			</Link>
		);

	return (
		<button
			className={cn(
				"justify-self-center h-full rounded-lg px-3 py-2 xl:px-4 xl:py-3 text-zinc-600 xl:text-lg",
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
		</button>
	);
}
