"use client"

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

export type DropdownOption = {
	value: string;
	label: string;
	disabled?: boolean;
	icon?: ReactNode;
	description?: string;
	href?: string;
	onClick?: () => void;
};

export type DropdownGroup = {
	label?: string;
	options: DropdownOption[];
};

type DropdownProps = {
	value?: string;
	defaultValue?: string;
	placeholder?: string;
	onValueChange?: (value: string) => void;
	options?: DropdownOption[];
	groups?: DropdownGroup[];
	disabled?: boolean;
	className?: string;
	triggerClassName?: string;
	contentClassName?: string;
	size?: "sm" | "md" | "lg";
	variant?: "default" | "ghost" | "outline";
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

export default function Dropdown({
	value,
	defaultValue,
	placeholder = "請選擇...",
	onValueChange,
	options,
	groups,
	disabled,
	className,
	triggerClassName,
	contentClassName,
	size = "md",
	variant = "default",
}: DropdownProps) {
	const router = useRouter();

	// 如果既沒有提供 options 也沒有提供 groups，則顯示空狀態
	if (!options && !groups) {
		return (
			<Select disabled>
				<SelectTrigger
					className={cn(
						sizeClasses[size],
						variantClasses[variant],
						triggerClassName,
						className
					)}
				>
					<SelectValue placeholder="無選項" />
				</SelectTrigger>
			</Select>
		);
	}

	// 獲取所有選項（無論是從 options 還是 groups 中）
	const getAllOptions = (): DropdownOption[] => {
		if (options) return options;
		if (groups) return groups.flatMap(group => group.options);
		return [];
	};

	const handleValueChange = (selectedValue: string) => {
		const allOptions = getAllOptions();
		const selectedOption = allOptions.find(option => option.value === selectedValue);

		if (selectedOption) {
			// 優先執行 onClick
			if (selectedOption.onClick) {
				selectedOption.onClick();
			}

			// 如果有 href，進行導覽
			if (selectedOption.href) {
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
					sizeClasses[size],
					variantClasses[variant],
					triggerClassName,
					className
				)}
			>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className={cn("min-w-[--radix-select-trigger-width]", contentClassName)}>
				{/* 渲染單一選項列表 */}
				{options && !groups && (
					<SelectGroup>
						{options.map((option, index) => (
							<SelectItem
								key={option.value || index}
								value={option.value}
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
					</SelectGroup>
				)}

				{/* 渲染分組選項 */}
				{groups &&
					groups.map((group, groupIndex) => (
						<div key={groupIndex}>
							<SelectGroup>
								{group.label && <SelectLabel>{group.label}</SelectLabel>}
								{group.options.map((option, optionIndex) => (
									<SelectItem
										key={option.value || `${groupIndex}-${optionIndex}`}
										value={option.value}
										disabled={option.disabled}
										className="flex items-center gap-2"
									>
										<div className="flex items-center gap-2">
											{option.icon && (
												<span className="flex-shrink-0">{option.icon}</span>
											)}
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
							</SelectGroup>
							{/* 如果不是最後一組，添加分隔線 */}
							{groupIndex < groups.length - 1 && <SelectSeparator />}
						</div>
					))}
			</SelectContent>
		</Select>
	);
}

// 輔助函數：創建選項
export function createDropdownOption(
	value: string,
	label: string,
	options?: {
		disabled?: boolean;
		icon?: ReactNode;
		description?: string;
		href?: string;
		onClick?: () => void;
	}
): DropdownOption {
	return {
		value,
		label,
		disabled: options?.disabled,
		icon: options?.icon,
		description: options?.description,
		href: options?.href,
		onClick: options?.onClick,
	};
}

// 輔助函數：創建分組
export function createDropdownGroup(
	label: string | undefined,
	options: DropdownOption[]
): DropdownGroup {
	return {
		label,
		options,
	};
}