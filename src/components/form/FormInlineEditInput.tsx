import { cn } from "@/lib/utils";
import React from "react";


export default function FormInlineEditInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			className={cn(
				"border-neutral-600 bg-transparent py-1 focus:border-b focus:outline-none focus:text-neutral-100",
				className
			)}
			autoComplete="off"
			{...props}
		/>
	);
}

