import { cn } from "@/lib/cn";
import React from "react";


export default function FormInlineEditInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			className={cn(
				"border-zinc-600 bg-transparent py-1 focus:border-b focus:outline-none focus:text-zinc-100",
				className
			)}
			autoComplete="off"
			{...props}
		/>
	);
}

