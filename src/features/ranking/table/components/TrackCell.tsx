import Image from "next/image";
import type { RankingListDataTypeExtend, RankingTableAppearance } from "../types";

type TrackCellProps = {
	item: RankingListDataTypeExtend;
	appearance?: RankingTableAppearance;
	imageSize?: "sm" | "md" | "lg";
};

const imageSizes = {
	sm: { width: "h-10 w-10", sizes: "40px" },
	md: { width: "h-14 w-14", sizes: "56px" },
	lg: { width: "h-16 w-16", sizes: "64px" },
};

export default function TrackCell({
	item,
	appearance = {},
	imageSize = "lg",
}: TrackCellProps) {
	const showImages = appearance.showImages !== false;
	const { width, sizes } = imageSizes[imageSize];

	return (
		<div className="flex items-center gap-3">
			{showImages && item.img && (
				<div className={`relative ${width} flex-shrink-0 overflow-hidden rounded-lg`}>
					<Image
						src={item.img}
						alt={item.name}
						fill
						sizes={sizes}
						className="object-cover"
					/>
				</div>
			)}
			<div className="min-w-0 flex-1">
				<p className="truncate font-semibold">{item.name}</p>
				{item.album?.name && (
					<p className="truncate text-sm text-muted-foreground">
						{item.album.name}
					</p>
				)}
			</div>
		</div>
	);
}