import { cn } from "@/lib/cn";
import React, { ButtonHTMLAttributes } from "react";

export type ButtonProps = {
	variant: "lime" | "gray" | "transparent";
	rounded?: boolean;
	children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const styles = {
	lime: {
		default: "bg-lime-500 text-zinc-950 hover:bg-zinc-100",
		disabled: "bg-lime-500 text-zinc-950",
	},
	gray: {
		default: "bg-zinc-800 text-zinc-100 hover:bg-zinc-900",
		disabled: "bg-zinc-800 text-zinc-100",
	},
	transparent: {
		default: "bg-transparent text-zinc-100 border border-zinc-500 hover:border-zinc-100",
		disabled: "bg-transparent text-zinc-100 border border-zinc-500",
	}
};

export default function Button({
	children,
	variant,
	rounded = false,
	disabled,
	className,
	...props
}: ButtonProps) {
	return (
		<button
			className={cn(
				` px-5 py-3 flex items-center gap-2 ${disabled ? styles[variant].disabled : styles[variant].default}`,
				className,
				{
					"opacity-70": disabled,
					"rounded-full": rounded,
					"rounded-md": !rounded,
				}
			)}
			{...props}
		>
			{children}
		</button>
	);
}



