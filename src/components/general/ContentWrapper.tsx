import { cn } from "@/lib/cn";
import React, { ReactNode } from "react";

type ContentWrapperProps = {
	children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export default function ContentWrapper({
	children,
	className,
}: ContentWrapperProps) {
	return <div className={cn("p-14 lg:p-8", className)}>{children}</div>;
}
