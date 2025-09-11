import { cn } from "@/lib/utils";

type EqualBtnProps = {
	isPressed: boolean;
	isSelected?: boolean;
	onClick: () => void;
	children: string;
};

export default function EqualBtn({ isPressed, isSelected, onClick, children }: EqualBtnProps) {
	return (
		<button
			className={cn(
				"col-span-1 row-span-1 flex cursor-pointer select-none flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 p-2 transition-all duration-150 ease-out hover:bg-neutral-800 hover:shadow-lg lg:p-5",
				{
					"bg-neutral-800 scale-95 shadow-md": isPressed,
					"border-blue-500 bg-blue-900/30": isSelected,
				}
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
}