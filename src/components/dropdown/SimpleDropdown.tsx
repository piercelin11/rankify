"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

export type SimpleDropdownOption = {
	value: string;
	label: string;
	disabled?: boolean;
	href?: string;
	onClick?: () => void;
	queryParam?: [string, string];
};

type SimpleDropdownProps = {
	value?: string;
	defaultValue?: string;
	placeholder?: string;
	onValueChange?: (value: string) => void;
	options: SimpleDropdownOption[];
	disabled?: boolean;
	className?: string;
	size?: "sm" | "md" | "lg";
	icon?: ReactNode;
};

const sizeClasses = {
	sm: "h-8 px-2 text-sm",
	md: "h-10 px-4 text-base",
	lg: "h-11 px-4 text-base",
};

export default function SimpleDropdown({
	value,
	defaultValue,
	placeholder = "Select...",
	onValueChange,
	options,
	disabled,
	className,
	size = "md",
	icon
}: SimpleDropdownProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const handleValueChange = (selectedValue: string) => {
		const selectedOption = options.find(
			(option) => option.value === selectedValue
		);

		if (selectedOption) {
			// 優先執行 onClick
			if (selectedOption.onClick) {
				selectedOption.onClick();
			}

			// 處理 queryParam 參數更新
			if (selectedOption.queryParam) {
				const params = new URLSearchParams(searchParams.toString());
				params.set(selectedOption.queryParam[0], selectedOption.queryParam[1]);
				router.push(`${pathname}?${params.toString()}`);
			}
			// 如果有 href，進行導覽
			else if (selectedOption.href) {
				router.push(selectedOption.href);
			}
		}

		// 執行原本的 onValueChange（如果提供的話）
		if (onValueChange) {
			onValueChange(selectedValue);
		}
	};

	return (
		<Select
			value={value}
			defaultValue={defaultValue}
			onValueChange={handleValueChange}
			disabled={disabled}
		>
			<SelectTrigger
				className={cn(
					"bg-field text-secondary-foreground hover:text-foreground focus:text-foreground",
					sizeClasses[size],
					className
				)}
			>
				<div className="flex items-center gap-2">
				{icon}
				<SelectValue placeholder={placeholder} />
				</div>
			</SelectTrigger>
			<SelectContent className="max-h-80 text-base">
				{options.map((option) => (
					<SelectItem
						className={cn("text-base", {
							"text-sm": size === "sm",
						})}
						key={option.value}
						value={option.value}
						disabled={option.disabled}
					>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
