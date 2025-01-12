import { cn } from "@/lib/cn";
import React, { InputHTMLAttributes } from "react";

type RadioData = {
	id: string;
	label: string;
};

type RadioItemProps = {
	label: string;
    isChecked: boolean;
    defaultChecked: boolean;
    value: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function RadioItem({ label, value, isChecked, defaultChecked, ...props }: RadioItemProps) {
	return (
		<label
			className={cn("flex items-center gap-2 text-zinc-500", {
				"text-zinc-100": isChecked,
			})}
		>
			<span
				className={cn("aspect-square w-3 rounded-full border", {
					"bg-lime-500": isChecked,
				})}
			/>
			<input
				type="radio"
				{...props}
				value={value}
				hidden
				defaultChecked={defaultChecked}
			/>
			{label}
		</label>
	);
}
