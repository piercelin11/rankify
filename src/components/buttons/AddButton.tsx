import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@radix-ui/react-icons";

export type ButtonProps = {
	rounded?: boolean;
} & React.ComponentProps<"button">;

export default function AddButton({
	disabled,
	className,
	...props
}: Omit<ButtonProps, "children">) {
	return (
		<Button
			className={cn(
				"m-3 flex aspect-square w-full h-auto items-center justify-center gap-2 rounded-full bg-muted hover:bg-accent",
				className,
				{
					"bg-muted opacity-70": disabled,
				}
			)}
			disabled={disabled}
			variant="secondary"
			{...props}
		>
			<PlusIcon width={35} height={35} />
		</Button>
	);
}
