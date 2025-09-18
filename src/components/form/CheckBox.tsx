import { cn } from "@/lib/utils";
import { CheckIcon } from "@radix-ui/react-icons";


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
				"flex h-6 w-6 aspect-square cursor-pointer items-center justify-center rounded border  hover:border-neutral-400",
				className,
				{
					"border-neutral-400 bg-neutral-800": checked,
				}
			)}
			{...props}
		>
			{checked && <CheckIcon />}
		</div>
	);
}
