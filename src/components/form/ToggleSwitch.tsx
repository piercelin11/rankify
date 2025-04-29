import React from "react";
import ToggleButton from "../buttons/ToggleButton";

type ToggleSwitchProps = {
	label: string;
	value: string;
	onChange: () => void;
	name: string;
	onBlur?: () => void;
	isChecked: boolean;
};

export default function ToggleSwitch({
	label,
	value,
	onChange,
	name,
	onBlur,
	isChecked,
}: ToggleSwitchProps) {
	return (
		<div className="flex items-center gap-10">
			<h4>{label}</h4>
			<label>
				<ToggleButton selected={isChecked} />
				<input
					name={name}
					onBlur={onBlur}
					onChange={onChange}
					value={value}
                    checked={isChecked}
					hidden
					type="checkbox"
				/>
			</label>
		</div>
	);
}
