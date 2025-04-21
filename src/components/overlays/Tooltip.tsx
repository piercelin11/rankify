"use client";
import { cn } from "@/lib/cn";
import React, { ReactNode, useState } from "react";
import { number } from "zod";

type TooltipProps = {
	children: ReactNode;
	content: string | ReactNode;
	position: number | "left" | "center" | "right";
	offest?: number;
};

export default function Tooltip({
	children,
	content,
	position,
	offest,
}: TooltipProps) {
	const [isHover, setHover] = useState<boolean>(false);

	return (
		<div
			className="relative"
			onMouseOver={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			{isHover && content && (
				<div
					className={cn("absolute bg-zinc-700 px-3 py-2 rounded-md font-numeric", {
						"-translate-x-1/2 transform":
							typeof position === "number" || position === "center",
						"left-0": position === "left",
						"left-1/2": position === "center",
						"right-0": position === "right",
					})}
					style={{
						top: offest,
						left: typeof position === "number" ? position + "%" : undefined,
					}}
				>
					{content}
				</div>
			)}
			{children}
		</div>
	);
}
