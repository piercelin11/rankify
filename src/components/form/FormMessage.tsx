import { cn } from "@/lib/cn";
import {
	CheckCircledIcon,
	ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import React from "react";

type ErrorMessageProps = {
	message: string;
	isError: boolean;
	border?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function FormMessage({
	message,
	isError,
	border = true,
	className,
}: ErrorMessageProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-1 rounded text-sm",
				className,
				{
					"px-4 py-3": border,
					"border border-rose-500 bg-rose-700/10 text-rose-500": isError && border,
					"border border-green-500 bg-green-700/10 text-green-500": !isError && border,
					"text-rose-600": isError && !border,
					"text-green-600": !isError && !border,
				}
			)}
		>
			{isError ? <ExclamationTriangleIcon /> : <CheckCircledIcon />}
			<p>{message}</p>
		</div>
	);
}
