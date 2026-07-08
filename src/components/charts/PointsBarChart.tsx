"use client";

import { useEffect, useState } from "react";
import { cn, toAcronym } from "@/lib/utils";
import { adjustColor, adjustSaturation } from "@/lib/utils/color.utils";
import { DEFAULT_COLOR, MUTED_COLOR } from "@/constants";

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
		tint: adjustColor(color, 1, 1),
		start: 0,
		stop: 150,
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

export default function PointsBarChart({ items }: Props) {
	const [mounted, setMounted] = useState(false);
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	useEffect(() => {
		const frame = requestAnimationFrame(() => setMounted(true));
		return () => cancelAnimationFrame(frame);
	}, []);

	const maxValue = Math.max(...items.map((item) => item.value), 1);

	return (
		<div className="flex h-full flex-col">
			<div className="flex flex-1 items-end">
				{items.map((item) => {
					const ratio = item.value / maxValue;
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
							<div
								className="relative min-h-[4px] w-full rounded-2xl px-2 transition-[height] duration-700 ease-out"
								style={{
									height: mounted ? `${Math.max(ratio * 100, 2)}%` : "0%",
								}}
								onMouseEnter={() => setHoveredId(item.id)}
								onMouseLeave={() => setHoveredId(null)}
							>
								{isHovered && (
									<div
										className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-sm font-semibold"
										style={{
											borderColor: item.color
												? adjustColor(item.color, 0.8, 3)
												: DEFAULT_COLOR,
											color: item.color
												? adjustColor(item.color, 0.8, 3)
												: DEFAULT_COLOR,
										}}
									>
										{item.value}
									</div>
								)}
								<div
									className="h-full w-full rounded-2xl"
									style={{ background }}
								/>
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-2 flex">
				{items.map((item) => (
					<div
						key={item.id}
						className={cn("w-full flex-1 truncate px-1 text-center text-xs text-muted-foreground", {
							"text-foreground": hoveredId === item.id
						})}
					>
						{toAcronym(item.label)}
					</div>
				))}
			</div>
		</div>
	);
}
