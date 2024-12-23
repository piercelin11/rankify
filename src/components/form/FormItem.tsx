import React from "react";
import Input from "../ui/Input";
import FormMessage from "./FormMessage";

type FormItemProps = {
	label: string;
	message?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function FormItem({
	label,
	message,
	className,
	...props
}: FormItemProps) {
	return (
		<div className="space-y-3">
			<p className="text-sm text-zinc-500">{label}</p>
			<Input className={className} {...props} />
			{message && (
				<FormMessage message={message} isError={true} border={false} />
			)}
		</div>
	);
}
