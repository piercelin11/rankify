"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

type TabOption = {
	label: string;
	value: string;
	href: string;
};

type PillTabsProps = {
	options: TabOption[];
	value: string;
	className?: string;
};

export default function PillTabs({ options, value, className }: PillTabsProps) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			{options.map((option) => (
				<Link key={option.value} href={option.href}>
					<PillButton
						isSelected={value === option.value}
						label={option.label}
					/>
				</Link>
			))}
		</div>
	);
}

function PillButton({
	isSelected,
	label,
}: {
	isSelected: boolean;
	label: string;
}) {
	return (
		<button
			className={cn(
				"rounded-full px-4 h-10 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
				isSelected
					? "bg-foreground text-background"
					: "bg-secondary text-secondary-foreground hover:bg-accent"
			)}
		>
			{label}
		</button>
	);
}
