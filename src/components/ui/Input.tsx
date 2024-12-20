import { cn } from "@/lib/cn";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import React from "react";

type InputProps = {} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
	return (
		<input
			className={cn(
				"w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 focus:outline-none",
				className
			)}
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
				{...props}
			/>
		</div>
	);
}
