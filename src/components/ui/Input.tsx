import { cn } from "@/lib/cn";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import React from "react";

type InputProps = {} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
	return (
		<input
			className={cn(
				"w-full rounded border border-zinc-700 bg-zinc-950 p-3 focus:outline-none focus:border-zinc-100",
				className
			)}
			autoComplete="off"
			{...props}
		/>
	);
}

export function InlineEditInput({ className, ...props }: InputProps) {
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

type SearchInputProps = {} & React.InputHTMLAttributes<HTMLInputElement>;

export function SearchInput({ className, ...props }: SearchInputProps) {
	return (
		<div className="flex w-2/3 items-center gap-2 rounded border border-zinc-700 bg-zinc-950 px-3 py-2">
			<MagnifyingGlassIcon className="text-zinc-500" width={20} height={20} />
			<input
				className={cn(
					"bg-transparent w-full text-zinc-500 placeholder:text-zinc-500 focus:outline-none",
					className
				)}
				autoComplete="off"
				{...props}
			/>
		</div>
	);
}
