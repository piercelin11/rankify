import React, { HTMLAttributes } from "react";
import {
	Tooltip as TooltipRoot,
	TooltipArrow,
	TooltipContent,
	TooltipPortal,
	TooltipProvider,
	TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

type TooltipProps = {
	content?: string | React.ReactNode | null;
	children: React.ReactNode;
	className?: HTMLAttributes<HTMLDivElement>["className"];
	position?: "top" | "right" | "bottom" | "left";
};

export default function Tooltip({
	content,
	children,
	position = "top",
	className,
}: TooltipProps) {
	return (
		<TooltipProvider delayDuration={0}>
			<TooltipRoot>
				<TooltipTrigger>{children}</TooltipTrigger>
				<TooltipPortal>
					<TooltipContent
						className={cn(
							"z-50 rounded-md bg-neutral-800 px-3 py-2 text-sm text-neutral-300",
							className
						)}
						side={position}
					>
						{content}
						<TooltipArrow className="mb-2 fill-neutral-800" />
					</TooltipContent>
				</TooltipPortal>
			</TooltipRoot>
		</TooltipProvider>
	);
}
