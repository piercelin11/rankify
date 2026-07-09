"use client";

import { useEffect, useState } from "react";
import { adjustColor, adjustSaturation } from "@/lib/utils/color.utils";
import { DEFAULT_COLOR, MUTED_COLOR } from "@/constants";
import Tooltip from "@/components/overlay/Tooltip";
import { toAcronym } from "@/lib/utils";

// 非-hover（預設狀態）的漸層設定
const DEFAULT_GRADIENT = {
	base: DEFAULT_COLOR,
	tint: adjustColor(DEFAULT_COLOR, 1, 1),
	start: 10,
	stop: 100,
};

// hover 中的漸層設定
function getHoverGradient(color: string | null) {
	return {
		base: adjustSaturation(color, 2.5),
		tint: adjustColor(color, 1, 1.5),
		start: 10,
		stop: 200,
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
	hoveredId?: string | null;
	onHoveredIdChange?: (id: string | null) => void;
};

export default function RatioBarChart({
	items,
	hoveredId: controlledHoveredId,
	onHoveredIdChange,
}: Props) {
	const [mounted, setMounted] = useState(false);
	const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
	const hoveredId = controlledHoveredId ?? localHoveredId;
	const setHoveredId = onHoveredIdChange ?? setLocalHoveredId;

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
						: `linear-gradient(to top, ${gradient.base} 0%, ${gradient.base} ${gradient.start}%, ${gradient.tint} max(${gradient.stop}%, 150px))`;

				return (
					<div key={item.id} className="flex h-full flex-1 items-end">
						<Tooltip content={<RatioTooltip tooltipData={item} />}>
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

function RatioTooltip({ tooltipData }: { tooltipData: BarItem }) {
	return (
		<div className="flex items-center gap-4">
			<div className="flex items-center gap-2">
				<span
					className="h-3 w-3 shrink-0 rounded-full"
					style={{ backgroundColor: tooltipData.color ?? DEFAULT_COLOR }}
				/>
				<span className="text-base font-semibold text-foreground">
					{toAcronym(tooltipData.label)}
				</span>
			</div>
			<div className="font-numeric text-base text-secondary-foreground">
				{Math.round(tooltipData.value * 100)}%
			</div>
		</div>
	);
}
