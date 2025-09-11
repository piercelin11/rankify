"use client";
import { DEFAULT_COLOR } from "@/constants";
import { cn } from "@/lib/utils";
import { adjustColor } from "@/lib/utils/color.utils";
import { throttle } from "@/lib/utils";
import Link from "next/link";
import React, { forwardRef, useEffect, useRef, useState } from "react";

export type TabOptionProps = {
	label: string;
	id: string;
	href?: string;
	onClick?: () => void;
};

type TabsProps = {
	options: TabOptionProps[];
	activeId?: string;
	color?: string | null;
};

type IndicatorStyleType = {
	left: number;
	width: number;
	opacity: number;
};

export default function Tabs({ options, activeId, color }: TabsProps) {
	const [pendingActiveId, setPendingActiveId] = useState<string | null>(null);
	const [indicatorStyle, setIndicatorStyle] =
		useState<IndicatorStyleType | null>(null);
	const tabRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

	function handlePendingActiveId(option: TabOptionProps) {
		setPendingActiveId(option.id);
	}

	useEffect(() => {
		if (pendingActiveId === activeId) setPendingActiveId(null);

		let activeTabRef: HTMLButtonElement | null | undefined;

		if (pendingActiveId) activeTabRef = tabRefs.current.get(pendingActiveId);
		else activeTabRef = tabRefs.current.get(activeId || "");

		if (activeTabRef) {
			setIndicatorStyle({
				left: activeTabRef.offsetLeft,
				width: activeTabRef.offsetWidth,
				opacity: 1,
			});
		} else {
			setIndicatorStyle(null);
		}
	}, [activeId, pendingActiveId]);

	//讓 indicator 寬度隨螢幕 resize 改變
	useEffect(() => {
		const recalculateIndicator = throttle(() => {
			const activeTabRef = tabRefs.current.get(activeId || "");
			console.log("recalculateIndicator");
			if (activeTabRef) {
				setIndicatorStyle({
					left: activeTabRef.offsetLeft,
					width: activeTabRef.offsetWidth,
					opacity: 1,
				});
			}
		});

		window.addEventListener("resize", recalculateIndicator);

		return () => window.removeEventListener("resize", recalculateIndicator);
	}, [activeId]);

	return (
		<div className="w-max select-none rounded-lg border border-neutral-600/60 bg-neutral-900/30 p-1">
			<div className="relative flex">
				{options.map((option) => (
					<TabItem
						key={option.id}
						option={option}
						isActive={
							pendingActiveId
								? option.id === pendingActiveId
								: option.id === activeId
						}
						ref={(el) => {
							if (el) tabRefs.current.set(option.id, el);
							else tabRefs.current.delete(option.id);
						}}
						onActiveId={() => handlePendingActiveId(option)}
					/>
				))}
				{indicatorStyle && (
					<div
						className="absolute h-full w-full rounded-md bg-primary-500 transition-all duration-200 ease-in-out"
						style={{
							...indicatorStyle,
							backgroundColor: color
								? adjustColor(color, 0.5)
								: DEFAULT_COLOR,
						}}
					/>
				)}
			</div>
		</div>
	);
}

type TabItemProps = {
	option: TabOptionProps;
	isActive: boolean;
	onActiveId: () => void;
};

const TabItem = forwardRef<HTMLButtonElement, TabItemProps>(
	({ option, isActive, onActiveId }, ref) => {
		if (option.href)
			return (
				<Link
					href={option.href}
					className={cn("z-10", { "pointer-events-none": isActive })}
				>
					<button
						className={cn(
							"z-10 h-full justify-self-center rounded-lg px-3 py-2 text-neutral-400 xl:px-4 xl:py-3",
							{
								"text-neutral-950": isActive,
							}
						)}
						ref={ref}
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
						"z-10 h-full justify-self-center rounded-lg px-3 py-2 text-neutral-400 xl:px-4 xl:py-3",
						{
							"text-neutral-950": isActive,
						}
					)}
					ref={ref}
					onClick={() => {
						onActiveId();
						if (option.onClick) option.onClick();
					}}
				>
					{option.label}
				</button>
			);
	}
);
