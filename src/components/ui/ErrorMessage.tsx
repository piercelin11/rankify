import { cn } from "@/lib/cn";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import React from "react";

type ErrorMessageProps = {
	message: string;
} & React.HTMLAttributes<HTMLDivElement>;

export default function ErrorMessage({
	message,
	className,
}: ErrorMessageProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-1 rounded border border-rose-500 bg-rose-700/10 px-4 py-3 text-rose-500",
				className
			)}
		>
			<ExclamationTriangleIcon />
			<p>{message}</p>
		</div>
	);
}
