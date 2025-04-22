import { cn } from "@/lib/cn";
import React from "react";

type RadioItemProps = {
	label: string;
	isChecked: boolean;
	value: string;
	onChange: () => void;
	name?: string;
	onBlur?: () => void;
};

export default function RadioItem({
	label,
	value,
	name,
	onChange,
	onBlur,
	isChecked,
}: RadioItemProps) {
	return (
		<label
			className={cn("flex items-center gap-2 text-neutral-500", {
				"text-neutral-100": isChecked,
			})}
		>
			<span
				className={cn("aspect-square w-3 rounded-full border", {
					"bg-primary-500": isChecked,
				})}
			/>
			<input
				type="radio"
				name={name}
				value={value}
				checked={isChecked}
				onChange={onChange}
				onBlur={onBlur}
				hidden
			/>
			{label}
		</label>
	);
}
