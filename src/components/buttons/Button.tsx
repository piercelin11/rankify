import { cn } from "@/lib/cn";
import { PlusIcon } from "@radix-ui/react-icons";
import React from "react";

export type ButtonProps = {
	variant: "primary" | "secondary" | "neutral" | "outline" | "ghost" | "menu";
	rounded?: boolean;
	children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const styles: Record<string, Record<"default" | "disabled", string>> = {
	primary: {
		default: "bg-primary-500 text-neutral-950 hover:bg-neutral-100",
		disabled: "bg-primary-500 text-neutral-950",
	},
	secondary: {
		default:
			"bg-neutral-800/80 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100",
		disabled: "bg-neutral-800/80 text-neutral-100",
	},
	neutral: {
		default:
			"bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 border border-neutral-800",
		disabled: "bg-neutral-900 text-neutral-100 border border-neutral-800",
	},
	outline: {
		default:
			"bg-transparent text-neutral-400 hover:text-neutral-100 border border-neutral-400/50 hover:border-neutral-100",
		disabled: "bg-transparent text-neutral-400 border border-neutral-500",
	},
	ghost: {
		default: "bg-transparent text-neutral-500 hover:text-neutral-100",
		disabled: "bg-transparent text-neutral-300",
	},
	menu: {
		default:
			"w-full text-lg bg-transparent text-neutral-300 hover:text-neutral-100 hover:bg-neutral-900 justify-center lg:justify-normal",
		disabled:
			"w-full text-lg bg-transparent text-neutral-300 justify-center lg:justify-normal",
	},
};

export default function Button({
	children,
	variant,
	rounded = false,
	disabled,
	className,
	type = "button",
	...props
}: ButtonProps) {
	return (
		<button
			className={cn(
				`text-label flex items-center gap-1 px-6 py-4 ${disabled ? styles[variant].disabled : styles[variant].default}`,
				className,
				{
					"opacity-70": disabled,
					"rounded-full": rounded,
					"rounded-xl": !rounded,
				}
			)}
			type={type}
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
