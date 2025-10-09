"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export type SimpleDropdownOption = {
	value: string;
	label: string;
	disabled?: boolean;
	href?: string;
	onClick?: () => void;
};

type SimpleDropdownProps = {
	value: string;
	placeholder?: string;
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
	placeholder = "Select...",
	options,
	disabled,
	className,
	size = "md",
	icon
}: SimpleDropdownProps) {
	const router = useRouter();

	const handleValueChange = (selectedValue: string) => {
		const selectedOption = options.find(
			(option) => option.value === selectedValue
		);

		if (selectedOption) {
			if (selectedOption.onClick) {
				selectedOption.onClick();
			} else if (selectedOption.href) {
				router.push(selectedOption.href);
			}
		}
	};

	return (
		<Select
			value={value}
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
