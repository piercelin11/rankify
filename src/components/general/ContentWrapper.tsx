import { cn } from "@/lib/cn";
import React, { ReactNode } from "react";

type ContentWrapperProps = {
	children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export default function ContentWrapper({
	children,
	className,
}: ContentWrapperProps) {
	return <div className={cn("p-8 2xl:p-14", className)}>{children}</div>;
}
