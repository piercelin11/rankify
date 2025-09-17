import { useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { DEFAULT_COLOR } from "@/constants";
import { adjustColor } from "@/lib/utils/color.utils";
import type { MenuOptionType } from "../types";

type TrackTagProps = {
	tag: MenuOptionType;
	isDefault?: boolean;
	onRemove?: () => void;
};

export default function TrackTag({
	tag,
	isDefault = false,
	onRemove,
}: TrackTagProps) {
	const [isHovering, setIsHovering] = useState(false);
	const color = tag.color ?? DEFAULT_COLOR;

	return (
		<div
			className="flex flex-none items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
			style={{
				backgroundColor: adjustColor(color, isHovering ? 0.15 : 0.08),
				border: `1px solid ${adjustColor(color, 0.3)}`,
				color: adjustColor(color, 0.9, 1.2),
			}}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
		>
			{!isDefault && onRemove && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					className="flex h-3 w-3 items-center justify-center rounded-full hover:bg-black/20 focus:outline-none focus:ring-1 focus:ring-white/30"
					aria-label={`Remove ${tag.name}`}
				>
					<Cross2Icon className="h-3 w-3" />
				</button>
			)}
			<span className="max-w-[100px] truncate">{tag.name}</span>
		</div>
	);
}