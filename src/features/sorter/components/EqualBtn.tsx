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
				"col-span-1 row-span-1 flex cursor-pointer select-none flex-col items-center justify-center rounded-xl border  bg-secondary p-2 transition-all duration-150 ease-out hover:bg-accent hover:shadow-lg lg:p-5",
				{
					"scale-95 bg-accent shadow-md": isPressed,
					"border-blue-500 bg-blue-900/30": isSelected,
				}
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
}