import React from "react";
import FormMessage from "./FormMessage";
import { cn } from "@/lib/cn";

type FormItemProps = {
	label: string;
	message?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function FormInput({
	label,
	message,
	className,
	...props
}: FormItemProps) {
	return (
		<div className="space-y-4">
			<p className="text-sm text-neutral-500">{label}</p>
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
				"w-full rounded-xl border border-neutral-700 bg-neutral-950 p-4 focus:outline-none focus:border-neutral-100",
				className
			)}
			autoComplete="off"
			{...props}
		/>
	);
}
