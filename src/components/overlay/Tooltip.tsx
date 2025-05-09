import React, { HTMLAttributes } from "react";
import {
	Tooltip as TooltipRoot,
	TooltipArrow,
	TooltipContent,
	TooltipPortal,
	TooltipProvider,
	TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { cn } from "@/lib/cn";

type TooltipProps = {
	content?: string | React.ReactNode | null;
	children: React.ReactNode;
	className?: HTMLAttributes<HTMLDivElement>["className"];
};

export default function Tooltip({
	content,
	children,
	className,
}: TooltipProps) {
	return (
		<TooltipProvider delayDuration={0}>
			<TooltipRoot>
				<TooltipTrigger>{children}</TooltipTrigger>
				<TooltipPortal>
					<TooltipContent
						className={cn(
							"rounded-md bg-neutral-800 px-3 py-2 text-sm text-neutral-300",
							className
						)}
					>
						{content}
						<TooltipArrow className="mb-2 fill-neutral-800" />
					</TooltipContent>
				</TooltipPortal>
			</TooltipRoot>
		</TooltipProvider>
	);
}
