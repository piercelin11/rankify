import { cn } from "@/lib/utils";


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
			"bg-neutral-800/80 text-secondary-foreground hover:bg-neutral-900 hover:text-foreground",
		disabled: "bg-neutral-800/80 text-foreground",
	},
	neutral: {
		default:
			"bg-neutral-900 text-secondary-foreground hover:bg-neutral-800 hover:text-foreground border ",
		disabled: "bg-neutral-900 text-foreground border ",
	},
	outline: {
		default:
			"bg-transparent text-secondary-foreground hover:text-foreground border border-neutral-400/50 hover:border-neutral-100",
		disabled: "bg-transparent text-secondary-foreground border ",
	},
	ghost: {
		default: "bg-transparent text-muted-foreground hover:text-foreground",
		disabled: "bg-transparent text-secondary-foreground",
	},
	menu: {
		default:
			"w-full text-lg bg-transparent text-secondary-foreground hover:text-foreground hover:bg-neutral-900 justify-center lg:justify-normal",
		disabled:
			"w-full text-lg bg-transparent text-secondary-foreground justify-center lg:justify-normal",
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
				` flex items-center gap-1 px-6 py-4 ${disabled ? styles[variant].disabled : styles[variant].default}`,
				className,
				{
					"opacity-70": disabled,
					"rounded-full": rounded,
					"rounded-xl": !rounded,
				}
			)}
			type={type}
			disabled={disabled}
			data-test-variant={variant}
			data-test-rounded={rounded}
			{...props}
		>
			{children}
		</button>
	);
}