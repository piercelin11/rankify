import { cn } from "@/lib/cn";
import { PlusIcon } from "@radix-ui/react-icons";
import React, { ButtonHTMLAttributes } from "react";

export type ButtonProps = {
	variant: "lime" | "gray" | "outline" | "transparent" | "menu";
	rounded?: boolean;
	children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const styles = {
	lime: {
		default: "bg-lime-500 text-zinc-950 hover:bg-zinc-100",
		disabled: "bg-lime-500 text-zinc-950",
	},
	gray: {
		default: "bg-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
		disabled: "bg-zinc-800/80 text-zinc-100",
	},
	outline: {
		default: "bg-transparent text-zinc-100 border border-zinc-500 hover:border-zinc-100",
		disabled: "bg-transparent text-zinc-100 border border-zinc-500",
	},
	transparent: {
		default: "bg-transparent text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900",
		disabled: "bg-transparent text-zinc-300",
	},
	menu: {
		default: "w-full text-lg bg-transparent text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900",
		disabled: "w-full text-lg bg-transparent text-zinc-300",
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

export function AddButton({
	variant,
	disabled,
	className,
	...props
} : Omit<ButtonProps, "children">) {
	return (
		<button
			className={cn(
				`aspect-square m-3 rounded-full flex items-center justify-center gap-2 ${disabled ? styles[variant].disabled : styles[variant].default}`,
				className,
				{
					"opacity-70": disabled,
				}
			)}
			{...props}
		>
			<PlusIcon width={35} height={35} />
		</button>
	);
}



