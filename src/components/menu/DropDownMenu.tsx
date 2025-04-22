"use client";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React, { Dispatch, ReactNode, SetStateAction, useState } from "react";

export type MenuOptionProps = {
	id: string;
	label: string;
	href?: string;
	onClick?: () => void;
};

type DropDownMenuProps = {
	options: MenuOptionProps[];
	defaultValue?: string;
	variant?: "light" | "dark";
};

export default function DropdownMenu({
	options,
	defaultValue,
	variant = "light",
}: DropDownMenuProps) {
	const [isOpen, setOpen] = useState(false);
	const [selected, setSelected] = useState<string | null>(null);

	function handleItemClick(item: MenuOptionProps) {
		setOpen(false);
		setSelected(item.label);

		if (item.onClick) {
			item.onClick();
		}
	}

	return (
		<div className="relative w-[300px] select-none">
			<DropdownSelect isOpen={isOpen} setOpen={setOpen} variant={variant}>
				{selected || defaultValue || "Select..."}
			</DropdownSelect>
			<DropdownList isOpen={isOpen} variant={variant}>
				{options.map((menuItem) => {
					const commonClass =
						"rounded-md px-4 py-3 text-neutral-500 hover:bg-neutral-850 hover:text-neutral-100 block";

					if (menuItem.href)
						return (
							<Link
								key={menuItem.id}
								href={menuItem.href}
								onClick={() => {
									handleItemClick(menuItem);
								}}
								className={commonClass}
								replace
							>
								{menuItem.label}
							</Link>
						);
					else
						return (
							<button
								key={menuItem.id}
								onClick={() => {
									handleItemClick(menuItem);
								}}
								className={commonClass}
							>
								{menuItem.label}
							</button>
						);
				})}
			</DropdownList>
		</div>
	);
}

type DropdownSelectProps = {
	children: ReactNode;
	isOpen: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	variant?: "light" | "dark";
};

export function DropdownSelect({
	children,
	isOpen,
	setOpen,
	variant = "light",
}: DropdownSelectProps) {
	return (
		<button
			className={cn(
				"flex w-full justify-between rounded-md bg-neutral-900 px-4 py-3 text-neutral-400 hover:text-neutral-300 hover:outline hover:outline-1 hover:outline-neutral-700",
				{
					"bg-neutral-950": variant === "dark",
				}
			)}
			onClick={() => setOpen((prev) => !prev)}
		>
			<div
				className={cn(
					"min-w-52 overflow-hidden text-ellipsis text-nowrap text-left",
					{
						"text-neutral-100": isOpen,
					}
				)}
			>
				{children}
			</div>
			<ChevronDownIcon
				className={cn("self-center text-neutral-400 transition ease-in-out", {
					"rotate-180 transform text-neutral-600": isOpen,
				})}
				width={18}
				height={18}
			/>
		</button>
	);
}

type DropdownListProps = {
	isOpen: boolean;
	children: ReactNode;
	variant?: "light" | "dark";
};

export function DropdownList({
	isOpen,
	children,
	variant = "light",
}: DropdownListProps) {
	return (
		<div
			className={cn(
				"absolute z-50 max-h-64 w-full overflow-auto rounded-md bg-neutral-900 opacity-0 transition ease-in-out",
				{
					"translate-y-3 opacity-100": isOpen,
					"pointer-events-none": !isOpen,
					"bg-neutral-950": variant === "dark",
				}
			)}
		>
			{children}
		</div>
	);
}
