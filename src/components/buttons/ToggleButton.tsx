import { cn } from "@/lib/cn";
import React from "react";

type ToggleButtonProps = {
	selected: boolean;
};

export default function ToggleButton({ selected }: ToggleButtonProps) {
	return (
		<div
			className={cn(
				"relative h-5 w-10 rounded-full outline outline-1 outline-zinc-600 transition-all",
				{
					"bg-lime-500": selected,
				}
			)}
		>
			<div
				className={cn(
					"relative left-0 h-5 w-5 rounded-full bg-zinc-950 outline outline-1 outline-zinc-600 transition-all",
					{
						"left-1/2": selected,
					}
				)}
			></div>
		</div>
	);
}
