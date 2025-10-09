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
	size?: "sm" | "md" | "lg";
	value: string;
	className?: string;
};

export default function PillTabs({
	options,
	size = "md",
	value,
	className,
}: PillTabsProps) {

	const sizeClasses = {
		sm: "h-8 px-4 text-sm",
		md: "h-10 px-4 text-base",
		lg: "h-12 px-4 text-base",
	};

	return (
		<div className={cn("flex items-center gap-2", className)}>
			{options.map((option) => (
				<Link key={option.value} href={option.href}>
					<button
						className={cn(
							"rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
							value === option.value
								? "bg-primary text-primary-foreground"
								: "bg-secondary text-secondary-foreground hover:bg-accent",
							sizeClasses[size]
						)}
					>
						{option.label}
					</button>
				</Link>
			))}
		</div>
	);
}

