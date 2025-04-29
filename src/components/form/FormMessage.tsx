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
				"flex items-center gap-1 rounded-xl text-sm",
				className,
				{
					"p-4": border,
					"border border-danger-500 bg-danger-700/10 text-danger-500": isError && border,
					"border border-success-500 bg-success-700/10 text-success-500": !isError && border,
					"text-danger-600": isError && !border,
					"text-success-600": !isError && !border,
				}
			)}
		>
			{isError ? <ExclamationTriangleIcon /> : <CheckCircledIcon />}
			<p>{message}</p>
		</div>
	);
}
