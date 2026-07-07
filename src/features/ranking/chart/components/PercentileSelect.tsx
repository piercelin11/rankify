"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PERCENTILE_OPTIONS, type PercentileKey } from "../constants";

type Props = {
	value: PercentileKey;
	onChange: (value: PercentileKey) => void;
};

export default function PercentileSelect({ value, onChange }: Props) {
	return (
		<Select value={value} onValueChange={(v) => onChange(v as PercentileKey)}>
			<SelectTrigger className="w-[140px]">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{PERCENTILE_OPTIONS.map((opt) => (
					<SelectItem key={opt.value} value={opt.value}>
						{opt.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
