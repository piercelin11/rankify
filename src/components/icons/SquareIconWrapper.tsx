import React, { ReactNode } from "react";

type SquareIconWrapperProps = {
	children: ReactNode;
};

export default function SquareIconWrapper({
	children,
}: SquareIconWrapperProps) {
	return <div className="rounded-md bg-neutral-100-500 p-1">{children}</div>;
}
