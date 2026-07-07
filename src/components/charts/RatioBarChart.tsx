"use client";

import { useEffect, useState } from "react";
import { adjustColor, adjustSaturation } from "@/lib/utils/color.utils";
import { DEFAULT_COLOR, MUTED_COLOR } from "@/constants";
import Tooltip from "@/components/overlay/Tooltip";

// 非-hover（預設狀態）的漸層設定
const DEFAULT_GRADIENT = {
	base: DEFAULT_COLOR,
	tint: adjustColor(DEFAULT_COLOR, 1, 1),
	start: 20,
	stop: 100,
};

// hover 中的漸層設定
function getHoverGradient(color: string | null) {
	return {
		base: adjustSaturation(color, 2.5),
		tint: adjustColor(color, 0.6, 1),
		start: 0,
		stop: 300,
	};
}

type BarItem = {
	id: string;
	label: string;
	value: number;
	color: string | null;
};

type Props = {
	items: BarItem[];
};

export default function RatioBarChart({ items }: Props) {
	const [mounted, setMounted] = useState(false);
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	useEffect(() => {
		const frame = requestAnimationFrame(() => setMounted(true));
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<div className="flex h-full items-end">
			{items.map((item) => {
				const isHovered = hoveredId === item.id;
				const hasHover = hoveredId !== null;
				const gradient = isHovered
					? getHoverGradient(item.color)
					: DEFAULT_GRADIENT;

				const background =
					hasHover && !isHovered
						? MUTED_COLOR
						: `linear-gradient(to top, ${gradient.base} 0%, ${gradient.base} ${gradient.start}%, ${gradient.tint} ${gradient.stop}%)`;

				return (
					<div key={item.id} className="flex h-full flex-1 items-end">
						<Tooltip
							content={`${item.label}: ${Math.round(item.value * 100)}%`}
						>
							<div
								className="min-h-[4px] w-full rounded-lg px-1 transition-[height] duration-700 ease-out"
								style={{
									height: mounted ? `${Math.max(item.value * 100, 2)}%` : "0%",
								}}
								onMouseEnter={() => setHoveredId(item.id)}
								onMouseLeave={() => setHoveredId(null)}
							>
								<div
									className="h-full w-full rounded-lg"
									style={{ background }}
								/>
							</div>
						</Tooltip>
					</div>
				);
			})}
		</div>
	);
}
