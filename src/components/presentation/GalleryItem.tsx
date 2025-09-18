import { PLACEHOLDER_PIC } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type GalleryItemProps = {
	href: string;
	img: string | null;
	title: string;
	subTitle: string;
};

export default function GalleryItem({
	href,
	img,
	title,
	subTitle,
}: GalleryItemProps) {
	return (
		<div className="rounded-lg p-3 hover:bg-accent">
			<Link href={href}>
				<div className="relative mb-4 aspect-square h-auto w-full">
					<Image
						className={cn("rounded", {
							rounded: subTitle !== "Artist",
							"rounded-full": subTitle === "Artist",
						})}
						src={img ?? PLACEHOLDER_PIC}
						alt={title}
						fill
						sizes="500px"
					/>
				</div>
				<p className="line-clamp-2">{title}</p>
				<p className="text-sm text-secondary-foreground">{subTitle}</p>
			</Link>
		</div>
	);
}
