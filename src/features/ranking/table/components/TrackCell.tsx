import Image from "next/image";
import type { RankingListDataTypeExtend } from "../types";

type TrackCellProps = {
	item: RankingListDataTypeExtend;
	imageSize?: "sm" | "md" | "lg";
};

const imageSizes = {
	sm: { width: "h-10 w-10", sizes: "40px" },
	md: { width: "h-14 w-14", sizes: "56px" },
	lg: { width: "h-16 w-16", sizes: "64px" },
};

export default function TrackCell({ item, imageSize = "lg" }: TrackCellProps) {
	const { sizes } = imageSizes[imageSize];

	return (
		<div className="flex items-center gap-3">
			{item.img && (
				<div
					className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg lg:h-14 lg:w-14`}
				>
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
