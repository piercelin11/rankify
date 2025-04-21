"use client";
import { DEFAULT_COLOR } from "@/config/variables";
import { cn } from "@/lib/cn";
import { ensureBrightness } from "@/lib/utils/adjustColor";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

export type TabOptionProps = {
	label: string;
	id: string;
	href?: string;
	onClick?: () => void;
};

type NavigationTabsProps = {
	options: TabOptionProps[];
	activeId?: string;
	color?: string | null;
};

export default function Tabs({
	options,
	activeId,
	color,
}: NavigationTabsProps) {
	const [pendingActiveId, setPendingActiveId] = useState<string | null>(null);

	function handlePendingActiveId(option: TabOptionProps) {
		setPendingActiveId(option.id);
	}

	useEffect(() => {
		if (pendingActiveId === activeId) setPendingActiveId(null);
	}, [activeId]);

	return (
		<div className="flex w-max select-none rounded-lg border border-zinc-800">
			{options.map((option) => (
				<TabItem
					key={option.id}
					option={option}
					isActive={
						pendingActiveId
							? option.id === pendingActiveId
							: option.id === activeId
					}
					color={color}
					onActiveId={() => handlePendingActiveId(option)}
				/>
			))}
		</div>
	);
}

function TabItem({
	option,
	color,
	isActive,
	onActiveId,
}: {
	option: TabOptionProps;
	color?: string | null;
	isActive: boolean;
	onActiveId: () => void;
}) {
	const activeColor = color ? ensureBrightness(color) : DEFAULT_COLOR;

	if (option.href)
		return (
			<Link
				href={option.href}
				className={isActive ? "pointer-events-none" : ""}
			>
				<button
					className={cn(
						"h-full justify-self-center rounded-lg px-3 py-2 text-zinc-600 xl:px-4 xl:py-3 xl:text-lg",
						{
							"text-zinc-950": isActive,
						}
					)}
					style={{
						backgroundColor: isActive ? activeColor : "#09090b",
					}}
					onClick={onActiveId}
				>
					{option.label}
				</button>
			</Link>
		);
	else
		return (
			<button
				className={cn(
					"h-full justify-self-center rounded-lg px-3 py-2 text-zinc-600 xl:px-4 xl:py-3 xl:text-lg",
					{
						"text-zinc-950": isActive,
					}
				)}
				style={{
					backgroundColor: isActive ? activeColor : "#09090b",
				}}
				onClick={() => {
					onActiveId();
					if (option.onClick) option.onClick();
				}}
			>
				{option.label}
			</button>
		);
}
