import { cn } from "@/lib/cn";
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
		<div className="p-3 hover:bg-zinc-900">
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
				<p className="text-sm text-zinc-400">{subTitle}</p>
			</Link>
		</div>
	);
}
