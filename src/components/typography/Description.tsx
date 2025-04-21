import { cn } from "@/lib/cn";
import React from "react";

type TextProps = {
	children: React.ReactNode;
} & React.HTMLAttributes<HTMLParagraphElement>;

export default function Description({ children, className, ...props }: TextProps) {
	return (
		<p className={cn("text-zinc-500", className)} {...props}>
			{children}
		</p>
	);
}
