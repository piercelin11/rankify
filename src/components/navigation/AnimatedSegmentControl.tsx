"use client";

import { useState, useRef, useEffect, forwardRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DEFAULT_COLOR } from "@/constants";
import { adjustColor } from "@/lib/utils/color.utils";
import { useThrottle } from "@/lib/hooks/useDebounceAndThrottle";

export type SegmentOption = {
	label: string;
	value: string;
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

type AnimatedSegmentControlProps = {
	options: SegmentOption[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	className?: string;
	size?: "sm" | "md" | "lg";
	color?: string | null;
};

export default function AnimatedSegmentControl({
	options,
	value,
	defaultValue,
	onValueChange,
	className,
	size = "md",
	color,
}: AnimatedSegmentControlProps) {
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
	const displayValue = pendingValue ? pendingValue : currentValue;

	const handleValueChange = useCallback((option: SegmentOption) => {
		setPendingValue(option.value);

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

	const updateIndicator = useCallback(() => {
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
	}, [displayValue]);

	useEffect(() => {
		if (pendingValue === currentValue) setPendingValue(null);
		updateIndicator();
	}, [currentValue, pendingValue, updateIndicator]);

	const throttledUpdateIndicator = useThrottle(() => {
		updateIndicator();
	}, 100);

	useEffect(() => {
		window.addEventListener("resize", throttledUpdateIndicator);
		return () => window.removeEventListener("resize", throttledUpdateIndicator);
	}, [throttledUpdateIndicator]);

	const sizeClasses = {
		sm: "h-8 text-sm",
		md: "h-10 text-base",
		lg: "h-12 text-base",
	};


	return (
		<div className={cn(
			"select-none rounded-lg overflow-hidden w-max border bg-field p-1",
			sizeClasses[size],
			className
		)}>
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
						onClick={() => !option.disabled && handleValueChange(option)}
						size={size}
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
		</div>
	);
}

type SegmentButtonProps = {
	option: SegmentOption;
	isActive: boolean;
	onClick: () => void;
	size: "sm" | "md" | "lg";
};

const SegmentButton = forwardRef<HTMLButtonElement, SegmentButtonProps>(
	function SegmentButton({ option, isActive, onClick, size }, ref) {
		const paddingClasses = {
			sm: "px-3 py-2",
			md: "px-4 py-2",
			lg: "px-4 py-2",
		};

		const baseClasses = cn(
			"z-10 h-full justify-self-center rounded-lg text-secondary-foreground transition-all duration-200 ease-in-out",
			paddingClasses[size],
			isActive && "text-primary-foreground",
			option.disabled && "cursor-not-allowed opacity-40"
		);

		if (option.href) {
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