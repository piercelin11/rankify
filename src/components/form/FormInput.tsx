import React from "react";
import FormMessage from "./FormMessage";
import { cn } from "@/lib/cn";

type FormItemProps = {
	title: string;
	message?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function FormInput({
	title,
	message,
	className,
	...props
}: FormItemProps) {
	return (
		<div className="space-y-3">
			<p className="text-sm text-neutral-500">{title}</p>
			<Input className={className} {...props} />
			{message && (
				<FormMessage message={message} isError={true} border={false} />
			)}
		</div>
	);
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			className={cn(
				"w-full rounded border border-neutral-700 bg-neutral-950 p-3 focus:outline-none focus:border-neutral-100",
				className
			)}
			autoComplete="off"
			{...props}
		/>
	);
}
