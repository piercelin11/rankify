import { cn } from "@/lib/utils";


type ToggleButtonProps = {
	selected: boolean;
};

export default function ToggleButton({ selected }: ToggleButtonProps) {
	return (
		<div
			className={cn(
				"relative h-5 w-10 rounded-full outline outline-1 outline-neutral-600 transition-all",
				{
					"bg-neutral-100-500": selected,
				}
			)}
		>
			<div
				className={cn(
					"relative left-0 h-5 w-5 rounded-full bg-neutral-950 outline outline-1 outline-neutral-600 transition-all",
					{
						"left-1/2": selected,
					}
				)}
			></div>
		</div>
	);
}
