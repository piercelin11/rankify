import { cn } from "@/lib/cn";
import {
	CheckCircledIcon,
	ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import React from "react";

type ErrorMessageProps = {
	message: string;
	isError: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function FormMessage({
	message,
	isError,
	className,
}: ErrorMessageProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-1 rounded border px-4 py-3",
				className,
				{
					"border-rose-500 bg-rose-700/10 text-rose-500": isError,
					"border-green-500 bg-green-700/10 text-green-500": !isError,
				}
			)}
		>
			{isError ? <ExclamationTriangleIcon /> : <CheckCircledIcon />}
			<p>{message}</p>
		</div>
	);
}
