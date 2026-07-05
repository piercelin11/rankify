import { PLACEHOLDER_PIC } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

type GalleryItemProps = {
	href: string;
	img: string | null;
	title: string;
	subTitle: string;
	type?: "ARTIST" | "ALBUM"
	actions?: ReactNode;
};

export default function GalleryItem({
	href,
	img,
	title,
	subTitle,
	type = "ARTIST",
	actions,
}: GalleryItemProps) {
	return (
		<div className="relative rounded-lg p-3 hover:bg-accent">
			{actions && (
				<div className="absolute right-2 top-2 z-10">{actions}</div>
			)}
			<Link href={href}>
				<div className="relative mb-4 aspect-square h-auto w-full">
					<Image
						className={cn("rounded", {
							rounded: type !== "ARTIST",
							"rounded-full": type === "ARTIST",
						})}
						src={img ?? PLACEHOLDER_PIC}
						alt={title}
						fill
						sizes="500px"
					/>
				</div>
				<p className="font-bold line-clamp-1 mb-1">{title}</p>
				<p className="text-sm text-secondary-foreground line-clamp-1">{subTitle}</p>
			</Link>
		</div>
	);
}
