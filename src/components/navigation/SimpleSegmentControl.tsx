"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type SegmentOption = {
	label: string;
	value: string;
	disabled?: boolean;
	href?: string;
	onClick?: () => void;
};

type SimpleSegmentControlProps = {
	options: SegmentOption[];
	value: string;
	className?: string;
	size?: "sm" | "md" | "lg";
	variant?: "primary" | "secondary" | "muted";
};

export default function SimpleSegmentControl({
	options,
	value,
	className,
	size = "md",
	variant = "secondary",
}: SimpleSegmentControlProps) {
	const handleValueChange = useCallback(
		(option: SegmentOption) => {
			if (option.onClick) {
				option.onClick();
			}
		},
		[]
	);

	const sizeClasses = {
		sm: "h-8 text-sm",
		md: "h-10 text-base",
		lg: "h-12 text-base",
	};

	const paddingClasses = {
		sm: "px-3",
		md: "px-4",
		lg: "px-4",
	};

	return (
		<div
			className={cn(
				"inline-flex select-none overflow-hidden rounded-lg border border-border",
				sizeClasses[size],
				className
			)}
		>
			{options.map((option, index) => {
				const isActive = value === option.value;
				const isLast = index === options.length - 1;

				const baseClasses = cn(
					"flex-1 text-nowrap flex items-center justify-center text-secondary-foreground appearance-none border-none outline-none transition-all duration-150",
					paddingClasses[size],
					!isLast && "border-r",
					{
						"bg-primary text-primary-foreground": isActive && variant === "primary",
						"bg-foreground text-background":
							isActive && variant === "secondary",
						"bg-secondary text-foreground": isActive && variant === "muted",
					},
					option.disabled && "cursor-not-allowed opacity-40"
				);

				if (option.href) {
					return (
						<Link
							key={option.value}
							href={option.href}
							className={baseClasses}
							onClick={() => !option.disabled && handleValueChange(option)}
						>
							{option.label}
						</Link>
					);
				}

				return (
					<button
						key={option.value}
						type="button"
						disabled={option.disabled}
						onClick={() => handleValueChange(option)}
						className={baseClasses}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
