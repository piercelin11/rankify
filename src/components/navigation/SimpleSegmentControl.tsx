"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export type SegmentOption = {
	label: string;
	value: string;
	disabled?: boolean;
	href?: string;
	onClick?: () => void;
	queryParam?: [string, string];
};

type SimpleSegmentControlProps = {
	options: SegmentOption[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	className?: string;
	size?: "sm" | "md" | "lg";
	variant?: "primary" | "secondary";
};

export default function SimpleSegmentControl({
	options,
	value,
	defaultValue,
	onValueChange,
	className,
	size = "md",
	variant = "secondary",
}: SimpleSegmentControlProps) {
	const [internalValue, setInternalValue] = useState(
		value || defaultValue || options[0]?.value || ""
	);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const currentValue = value !== undefined ? value : internalValue;

	const handleValueChange = useCallback((option: SegmentOption) => {
		if (value === undefined) {
			setInternalValue(option.value);
		}
		onValueChange?.(option.value);

		if (option.queryParam) {
			const params = new URLSearchParams(searchParams.toString());
			params.set(option.queryParam[0], option.queryParam[1]);
			router.push(`${pathname}?${params.toString()}`);
		}

		if (option.onClick) {
			option.onClick();
		}
	}, [value, onValueChange, router, pathname, searchParams]);

	const sizeClasses = {
		sm: "h-8 text-sm",
		md: "h-10 text-base",
		lg: "h-12 text-base",
	};

	const paddingClasses = {
		sm: "px-3 py-2",
		md: "px-4 py-2",
		lg: "px-4 py-2",
	};

	return (
		<div className={cn(
			"select-none rounded-lg overflow-hidden inline-flex border border-neutral-300 dark:border-neutral-700",
			sizeClasses[size],
			className
		)}>
			{options.map((option, index) => {
				const isActive = currentValue === option.value;
				const isLast = index === options.length - 1;

				const baseClasses = cn(
					"flex-1 text-nowrap appearance-none border-none outline-none transition-all duration-150",
					paddingClasses[size],
					!isLast && "border-r border-neutral-300 dark:border-neutral-700",
					isActive
						? variant === "primary"
							? "bg-primary-500 text-neutral-950"
							: "bg-neutral-100 text-neutral-900 dark:bg-neutral-700/50 dark:text-neutral-100"
						: "bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
					option.disabled &&
						"cursor-not-allowed opacity-40 hover:bg-white dark:hover:bg-neutral-800"
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