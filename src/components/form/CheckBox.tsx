import { cn } from "@/lib/cn";
import { CheckIcon } from "@radix-ui/react-icons";
import React from "react";

type CheckBoxProps = {
	checked: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function CheckBox({
	checked,
	className,
	...props
}: CheckBoxProps) {
	return (
		<div
			className={cn(
				"flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-zinc-700 hover:border-zinc-400",
				className,
				{
					"border-zinc-400 bg-zinc-800": checked,
				}
			)}
			{...props}
		>
			{checked && <CheckIcon />}
		</div>
	);
}
