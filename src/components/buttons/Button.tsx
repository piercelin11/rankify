import { cn } from "@/lib/cn";
import { PlusIcon } from "@radix-ui/react-icons";
import React, { ButtonHTMLAttributes } from "react";

export type ButtonProps = {
	variant: "primary" | "secondary" | "neutral" | "outline" | "ghost" | "menu";
	rounded?: boolean;
	children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const styles: Record<string, Record<"default" | "disabled", string>> = {
	primary: {
		default: "bg-primary-500 text-zinc-950 hover:bg-zinc-100",
		disabled: "bg-primary-500 text-zinc-950",
	},
	secondary: {
		default:
			"bg-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
		disabled: "bg-zinc-800/80 text-zinc-100",
	},
	neutral: {
		default: "bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
		disabled: "bg-zinc-900 text-zinc-100",
	},
	outline: {
		default:
			"bg-transparent text-zinc-100 border border-zinc-500 hover:border-zinc-100",
		disabled: "bg-transparent text-zinc-100 border border-zinc-500",
	},
	ghost: {
		default:
			"bg-transparent text-zinc-500 hover:text-zinc-100",
		disabled: "bg-transparent text-zinc-300",
	},
	menu: {
		default:
			"w-full text-lg bg-transparent text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 justify-center lg:justify-normal",
		disabled:
			"w-full text-lg bg-transparent text-zinc-300 justify-center lg:justify-normal",
	},
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
				`flex select-none items-center gap-2 px-5 py-3 ${disabled ? styles[variant].disabled : styles[variant].default}`,
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
}: Omit<ButtonProps, "children">) {
	return (
		<button
			className={cn(
				`m-3 flex aspect-square items-center justify-center gap-2 rounded-full ${disabled ? styles[variant].disabled : styles[variant].default}`,
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
