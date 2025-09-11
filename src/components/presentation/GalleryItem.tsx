import { cn } from "@/lib/utils";
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
		<div className="p-3 rounded-2xl hover:bg-neutral-900">
			<Link href={href}>
				<img
					className={cn("mb-4 rounded", {
						rounded: subTitle !== "Artist",
						"rounded-full": subTitle === "Artist",
					})}
					src={img ?? undefined}
					alt={title}
				/>
				<p className="line-clamp-2">{title}</p>
				<p className="text-sm text-neutral-400">{subTitle}</p>
			</Link>
		</div>
	);
}
