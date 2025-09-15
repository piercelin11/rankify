"use client"

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

type NavigationOption = {
	label: string;
	href?: string;
	onClick?: () => void;
	disabled?: boolean;
	icon?: ReactNode;
	description?: string;
};

type NavigationDropdownProps = {
	placeholder?: string;
	options: NavigationOption[];
	disabled?: boolean;
	className?: string;
	size?: "sm" | "md" | "lg";
	variant?: "default" | "ghost" | "outline";
	onNavigate?: (option: NavigationOption) => void; // 導覽前的回調
};

const sizeClasses = {
	sm: "h-8 px-2 text-xs",
	md: "h-9 px-3 text-sm",
	lg: "h-10 px-4 text-base",
};

const variantClasses = {
	default: "border-input bg-background",
	ghost: "border-transparent bg-transparent hover:bg-accent",
	outline: "border-border bg-transparent",
};

export default function NavigationDropdown({
	placeholder = "前往...",
	options,
	disabled,
	className,
	size = "md",
	variant = "default",
	onNavigate,
}: NavigationDropdownProps) {
	const router = useRouter();

	const handleNavigation = (selectedValue: string) => {
		// 使用 label 作為識別（因為純導覽不需要持久的 value）
		const selectedOption = options.find(option => option.label === selectedValue);

		if (selectedOption) {
			// 執行導覽前回調
			if (onNavigate) {
				onNavigate(selectedOption);
			}

			// 優先執行 onClick
			if (selectedOption.onClick) {
				selectedOption.onClick();
			}

			// 如果有 href，進行導覽
			if (selectedOption.href) {
				router.push(selectedOption.href);
			}
		}
	};

	return (
		<Select onValueChange={handleNavigation} disabled={disabled}>
			<SelectTrigger
				className={cn(
					sizeClasses[size],
					variantClasses[variant],
					className
				)}
			>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((option, index) => (
					<SelectItem
						key={`${option.label}-${index}`}
						value={option.label}
						disabled={option.disabled}
						className="flex items-center gap-2"
					>
						<div className="flex items-center gap-2">
							{option.icon && <span className="flex-shrink-0">{option.icon}</span>}
							<div className="flex flex-col">
								<span>{option.label}</span>
								{option.description && (
									<span className="text-xs text-muted-foreground">
										{option.description}
									</span>
								)}
							</div>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

// 輔助函數：創建導覽選項
export function createNavigationOption(
	label: string,
	options?: {
		href?: string;
		onClick?: () => void;
		disabled?: boolean;
		icon?: ReactNode;
		description?: string;
	}
): NavigationOption {
	return {
		label,
		href: options?.href,
		onClick: options?.onClick,
		disabled: options?.disabled,
		icon: options?.icon,
		description: options?.description,
	};
}