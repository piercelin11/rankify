import { useState } from "react";
import { DEFAULT_COLOR } from "@/constants";
import { adjustColor } from "@/lib/utils/color.utils";
import type { ParentOptionType } from "../types";

type AlbumFilterButtonProps = {
	album: ParentOptionType;
	isSelected: boolean;
	onClick: () => void;
};

export default function AlbumFilterButton({
	album,
	isSelected,
	onClick,
}: AlbumFilterButtonProps) {
	const [isHovering, setIsHovering] = useState(false);
	const color = album.color ?? DEFAULT_COLOR;

	return (
		<button
			onClick={onClick}
			className="rounded-full px-2.5 py-1 text-sm font-medium transition-all"
			style={{
				backgroundColor: adjustColor(
					color,
					isSelected || isHovering ? 0.15 : 0.05
				),
				border: `1px solid ${adjustColor(color, isSelected ? 0.7 : 0.2)}`,
				color: adjustColor(color, isSelected || isHovering ? 1 : 0.6, 1.2),
			}}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
		>
			{album.name}
		</button>
	);
}