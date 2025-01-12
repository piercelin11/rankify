import { cn } from "@/lib/cn";
import React, { InputHTMLAttributes, useState } from "react";
import { FieldValues, Path, PathValue, UseFormSetValue } from "react-hook-form";

type MenuData<T> = {
	value: PathValue<T, Path<T>>;
	label: string;
};

type SelectorInputProps<T extends FieldValues> = {
	menuData: MenuData<T>[];
	setValue: UseFormSetValue<T>;
	value: PathValue<T, Path<T>>;
	name: Path<T>;
} & InputHTMLAttributes<HTMLInputElement>;

export default function SelectorInput<T extends FieldValues>({
	menuData,
	setValue,
	value,
	name,
	...props
}: SelectorInputProps<T>) {
	const [isOpen, setOpen] = useState<boolean>(false);

	function handleMenuClick(value: PathValue<T, Path<T>>) {
		setValue(name, value);
		setOpen(false);
	}

	return (
		<div className="relative">
			<div onClick={() => setOpen((prev) => !prev)}>
				<p>{value || "Non-album track"}</p>
			</div>
			<div
				className={cn(
					"absolute z-10 max-h-64 w-full overflow-auto rounded-md bg-zinc-800 opacity-0 transition ease-in-out",
					{
						"translate-y-4 opacity-100": isOpen,
						"pointer-events-none": !isOpen,
					}
				)}
			>
				{menuData.map((menuItem) => (
					<div
						key={menuItem.value}
						className="px-4 py-3 hover:bg-zinc-750"
						onClick={() => handleMenuClick(menuItem.value)}
					>
						<p>{menuItem.label}</p>
					</div>
				))}
			</div>
			{isOpen && (
				<div
					className="fixed left-0 top-0 h-screen w-screen"
					onClick={() => setOpen(false)}
				></div>
			)}
			<input
				type="text"
				className="text-zinc-950"
				name={name}
				hidden
				{...props}
			/>
		</div>
	);
}
