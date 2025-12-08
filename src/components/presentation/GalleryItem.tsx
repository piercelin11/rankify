import { PLACEHOLDER_PIC } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type GalleryItemProps = {
	href: string;
	img: string | null;
	title: string;
	subTitle: string;
	type?: "ARTIST" | "ALBUM"
};

export default function GalleryItem({
	href,
	img,
	title,
	subTitle,
	type = "ARTIST"
}: GalleryItemProps) {
	return (
		<div className="rounded-lg p-3 hover:bg-accent">
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
