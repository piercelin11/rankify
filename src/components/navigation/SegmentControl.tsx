"use client";

import { useState, useRef, useEffect, forwardRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DEFAULT_COLOR } from "@/constants";
import { adjustColor } from "@/lib/utils/color.utils";
import { throttle } from "@/lib/utils/performance.utils";

export type SegmentOption = {
	label: string;
	value: string; // 統一使用 value 作為標識
	disabled?: boolean;
	href?: string;
	onClick?: () => void;
	queryParam?: [string, string];
};

type IndicatorStyle = {
	left: number;
	width: number;
	opacity: number;
};

type SegmentControlProps = {
	options: SegmentOption[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	className?: string;
	size?: "sm" | "md" | "lg";
	variant?: "simple" | "animated";
	color?: string | null;
};

export default function SegmentControl({
	options,
	value,
	defaultValue,
	onValueChange,
	className,
	size = "md",
	variant = "simple",
	color,
}: SegmentControlProps) {
	const [internalValue, setInternalValue] = useState(
		value || defaultValue || options[0]?.value || ""
	);
	const [pendingValue, setPendingValue] = useState<string | null>(null);
	const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle | null>(null);
	const segmentRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const currentValue = value !== undefined ? value : internalValue;
	const displayValue = variant === "animated" && pendingValue ? pendingValue : currentValue;

	const handleValueChange = useCallback((option: SegmentOption) => {
		if (variant === "animated") {
			setPendingValue(option.value);
		}

		if (value === undefined) {
			setInternalValue(option.value);
		}
		onValueChange?.(option.value);

		// 處理導航
		if (option.queryParam) {
			const params = new URLSearchParams(searchParams.toString());
			params.set(option.queryParam[0], option.queryParam[1]);
			router.push(`${pathname}?${params.toString()}`);
		}

		// 執行 onClick
		if (option.onClick) {
			option.onClick();
		}
	}, [value, onValueChange, variant, router, pathname, searchParams]);

	const updateIndicator = useCallback(() => {
		if (variant !== "animated") return;

		const activeSegmentRef = segmentRefs.current.get(displayValue);
		if (activeSegmentRef) {
			setIndicatorStyle({
				left: activeSegmentRef.offsetLeft,
				width: activeSegmentRef.offsetWidth,
				opacity: 1,
			});
		} else {
			setIndicatorStyle(null);
		}
	}, [variant, displayValue]);

	useEffect(() => {
		if (variant === "animated") {
			if (pendingValue === currentValue) setPendingValue(null);
			updateIndicator();
		}
	}, [currentValue, pendingValue, updateIndicator, variant]);

	// 處理螢幕 resize（僅動畫版本需要）
	useEffect(() => {
		if (variant !== "animated") return;

		const recalculateIndicator = throttle(() => {
			updateIndicator();
		}, 100);

		window.addEventListener("resize", recalculateIndicator);
		return () => window.removeEventListener("resize", recalculateIndicator);
	}, [updateIndicator, variant]);

	const sizeClasses = {
		sm: "h-8 text-sm",
		md: "h-10 text-base",
		lg: "h-12 text-base",
	};

	const containerClasses = cn(
		"select-none rounded-lg overflow-hidden",
		variant === "simple"
			? "inline-flex border border-neutral-300 dark:border-neutral-700"
			: "w-max border border-neutral-600/60 bg-neutral-900/50 p-1",
		sizeClasses[size],
		className
	);

	return (
		<div className={containerClasses}>
			{variant === "animated" && (
				<div className="relative flex">
					{options.map((option) => (
						<SegmentButton
							key={option.value}
							ref={(el) => {
								if (el) segmentRefs.current.set(option.value, el);
								else segmentRefs.current.delete(option.value);
							}}
							option={option}
							isActive={displayValue === option.value}
							isLast={false}
							onClick={() => !option.disabled && handleValueChange(option)}
							size={size}
							variant={variant}
						/>
					))}
					{indicatorStyle && (
						<div
							className="absolute h-full rounded-md transition-all duration-200 ease-in-out"
							style={{
								...indicatorStyle,
								backgroundColor: color
									? adjustColor(color, 0.5)
									: DEFAULT_COLOR,
							}}
						/>
					)}
				</div>
			)}

			{variant === "simple" && (
				<>
					{options.map((option, index) => (
						<SegmentButton
							key={option.value}
							option={option}
							isActive={currentValue === option.value}
							isLast={index === options.length - 1}
							onClick={() => !option.disabled && handleValueChange(option)}
							size={size}
							variant={variant}
						/>
					))}
				</>
			)}
		</div>
	);
}

type SegmentButtonProps = {
	option: SegmentOption;
	isActive: boolean;
	isLast: boolean;
	onClick: () => void;
	size: "sm" | "md" | "lg";
	variant: "simple" | "animated";
};

const SegmentButton = forwardRef<HTMLButtonElement, SegmentButtonProps>(
	function SegmentButton({ option, isActive, isLast, onClick, size, variant }, ref) {
		const paddingClasses = {
			sm: "px-3 py-2",
			md: "px-4 py-2",
			lg: "px-4 py-2",
		};

		const baseClasses = cn(
			"flex-1 text-nowrap",
			variant === "simple" && "transition-all duration-150",
			variant === "animated" && "transition-all duration-200 ease-in-out",
			paddingClasses[size],
			variant === "simple" && [
				"appearance-none border-none outline-none",
				!isLast && "border-r border-neutral-300 dark:border-neutral-700",
				isActive
					? "bg-neutral-100 text-neutral-900 dark:bg-neutral-700/50 dark:text-neutral-100"
					: "bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
				option.disabled &&
					"cursor-not-allowed opacity-40 hover:bg-white dark:hover:bg-neutral-800"
			],
			variant === "animated" && [
				"z-10 h-full justify-self-center rounded-lg text-neutral-400",
				isActive && "text-neutral-900",
				option.disabled && "cursor-not-allowed opacity-40"
			]
		);

		if (option.href) {
			if (variant === "animated") {
				return (
					<Link
						href={option.href}
						className={cn("z-10", isActive && "pointer-events-none")}
						onClick={() => !option.disabled && onClick()}
					>
						<button
							ref={ref}
							className={baseClasses}
						>
							{option.label}
						</button>
					</Link>
				);
			}
			return (
				<Link
					href={option.href}
					className={baseClasses}
					onClick={() => !option.disabled && onClick()}
				>
					{option.label}
				</Link>
			);
		}

		return (
			<button
				ref={ref}
				type="button"
				disabled={option.disabled}
				onClick={onClick}
				className={baseClasses}
			>
				{option.label}
			</button>
		);
	}
);