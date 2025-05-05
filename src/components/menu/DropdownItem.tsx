import React from "react";

type DropdownItemProps = {
	onClick?: () => void;
	children: string;
};

export default function DropdownItem({ children, onClick }: DropdownItemProps) {
	return (
		<button
			className="text-label w-full rounded-md px-4 py-2 text-left text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
			onClick={onClick}
		>
			{children}
		</button>
	);
}
