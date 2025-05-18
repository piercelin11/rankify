import { cn } from "@/lib/cn";
import { PlusIcon } from "@radix-ui/react-icons";

export type ButtonProps = {
	variant: "primary" | "secondary" | "neutral" | "outline" | "ghost" | "menu";
	rounded?: boolean;
} & React.ComponentProps<"button">;

export default function AddButton({
	variant,
	disabled,
	className,
	...props
}: Omit<ButtonProps, "children">) {
	return (
		<button
			className={cn(
				"m-3 flex aspect-square items-center justify-center gap-2 rounded-full bg-neutral-800/80 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100",
				className,
				{
					"bg-neutral-800/80 text-neutral-100 opacity-70": disabled,
				}
			)}
			disabled={disabled}
			{...props}
		>
			<PlusIcon width={35} height={35} />
		</button>
	);
}
