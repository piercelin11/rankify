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
};

const sizeClasses = {
	sm: "h-9 px-3 text-sm",
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
					" bg-field text-secondary-foreground hover:text-foreground focus:text-foreground",
					sizeClasses[size],
					className
				)}
			>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="text-base">
				{options.map((option) => (
					<SelectItem
						className="text-base"
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
