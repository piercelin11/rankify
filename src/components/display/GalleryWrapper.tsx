import { cn } from "@/lib/cn";
import { HTMLAttributes, ReactNode } from "react";

type GalleryGridLayoutProps = {
	children: ReactNode[];
} & HTMLAttributes<HTMLDivElement>;

export default function GalleryWrapper({
	children,
	className
}: GalleryGridLayoutProps) {
	return <div className={cn("grid grid-cols-8 -mx-2", className)}>{children}</div>;
}
