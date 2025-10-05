"use client";

import { CheckIcon } from "@radix-ui/react-icons";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import { Progress } from "@/components/ui/progress";
import { useSorterContext } from "@/contexts/SorterContext";

type SorterHeaderProps = {
	title: string;
};

export default function SorterHeader({ title }: SorterHeaderProps) {
	const { saveStatus, percentage } = useSorterContext();

	return (
		<div className="grid h-20 items-center border-b px-4 sm:grid-cols-3">
			<div className="flex items-center gap-2 justify-self-center sm:justify-self-auto">
				{/* <LogoDisplay /> */}
				<div className="hidden h-5 justify-end text-muted-foreground lg:flex">
					{saveStatus === "saved" ? (
						<div className="flex items-center gap-1">
							<CheckIcon />
							<p className="text-sm">Saved</p>
						</div>
					) : saveStatus === "pending" ? (
						<div className="flex items-center gap-2">
							<LoadingAnimation size="small" isFull={false} />
							<p className="text-sm">Saving...</p>
						</div>
					) : (
						""
					)}
				</div>
			</div>

			<div className="hidden justify-self-center sm:block">
				<p className="text-secondary-foreground">{title}&apos;s Sorter</p>
			</div>
			<div className="mt-2 w-full justify-self-end sm:w-fit">
				<div className="relative w-full sm:w-[150px] xl:w-[300px]">
					<p
						className="absolute -top-5 -translate-x-full text-right text-sm text-muted-foreground"
						style={{ left: `${percentage}%` }}
					>
						{percentage}%
					</p>
					<Progress value={percentage} className="h-2" />
				</div>
			</div>
		</div>
	);
}
