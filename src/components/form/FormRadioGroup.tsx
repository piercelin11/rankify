import React from "react";
import RadioItem from "./RadioItem";

export type FormOptionType = {
	id: string;
	label: string;
	value?: string;
};

type FormRadioGroupProps = {
	options: FormOptionType[];
	title: string;
	value: string;
	onChange: () => void;
	onBlur?: () => void;
};

export default function FormRadioGroup({
	options,
	title,
	value,
	onChange,
	onBlur,
}: FormRadioGroupProps) {
	return (
		<div className="space-y-4">
			<p className="text-sm text-neutral-500">{title}</p>
			<div className="flex gap-6">
				{options.map((option) => (
					<RadioItem
						key={option.id}
						label={option.label}
						value={option.value}
						isChecked={option.value === value}
						onChange={onChange}
                        onBlur={onBlur}
					/>
				))}
			</div>
		</div>
	);
}
