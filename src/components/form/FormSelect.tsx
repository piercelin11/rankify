import React from "react";
import { FormOptionType } from "./FormRadioGroup";

type FormSelectProps = {
	title: string;
	options: FormOptionType[];
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export default function FormSelect({
	title,
	options,
	...props
}: FormSelectProps) {
	return (
		<div className="space-y-3">
			<p className="text-sm text-neutral-500">{title}</p>
			<select
				className="w-full rounded-md border border-neutral-600 bg-neutral-950 p-2 focus:outline-none"
				{...props}
			>
				{options.map((option) => (
					<option key={option.id} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}
