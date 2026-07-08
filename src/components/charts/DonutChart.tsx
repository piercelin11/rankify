"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	type ActiveElement,
	type ChartEvent,
	type TooltipModel,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import colorConvert from "color-convert";
import { DEFAULT_COLOR, MUTED_COLOR } from "@/constants";
import { adjustSaturation, cn } from "@/lib/utils";

ChartJS.register(ArcElement, Tooltip);

const [DEFAULT_R, DEFAULT_G, DEFAULT_B] = colorConvert.hex.rgb(
	DEFAULT_COLOR.slice(1)
);

const DEFAULT_RENDER_DURATION = 500;
const DEFAULT_HOVER_DURATION = 0;
const DEFAULT_TOOLTIP_DURATION = 0;

// 依排名遞減不透明度，最低不低於原色的 20%
function getDefaultColorForIndex(index: number, total: number): string {
	const ratio = Math.max((total - index) / total, 0.05);
	return `rgba(${DEFAULT_R}, ${DEFAULT_G}, ${DEFAULT_B}, ${ratio})`;
}

type TooltipData = {
	label: string;
	value: string;
	color: string;
	x: number;
	y: number;
};

type Props = {
	labels: string[];
	data: number[];
	colors: (string | null)[];
	ids: string[];
	hoveredId?: string | null;
	onHoveredIdChange?: (id: string | null) => void;
	/** 圖表首次渲染（弧形進場）動畫時長，單位 ms */
	renderDuration?: number;
	/** hover 顏色變化動畫時長，單位 ms */
	hoverDuration?: number;
	/** 自訂 tooltip 顯示/隱藏的 CSS transition 時長，單位 ms */
	tooltipDuration?: number;
};

export default function DonutChart({
	labels,
	data,
	colors,
	ids,
	hoveredId,
	onHoveredIdChange,
	renderDuration = DEFAULT_RENDER_DURATION,
	hoverDuration = DEFAULT_HOVER_DURATION,
	tooltipDuration = DEFAULT_TOOLTIP_DURATION,
}: Props) {
	const [localHoveredIndex, setLocalHoveredIndex] = useState<number | null>(
		null
	);
	const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
	const [tooltipVisible, setTooltipVisible] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const hasRenderedRef = useRef(false);

	useEffect(() => {
		hasRenderedRef.current = true;
	}, []);

	let controlledIndex: number | null | undefined;
	if (hoveredId === undefined) {
		controlledIndex = undefined;
	} else if (hoveredId === null) {
		controlledIndex = null;
	} else {
		const index = ids.indexOf(hoveredId);
		controlledIndex = index === -1 ? null : index;
	}
	const hoveredIndex = controlledIndex ?? localHoveredIndex;

	const backgroundColor = useMemo(
		() =>
			colors.map((color, index) =>
				hoveredIndex === null
					? getDefaultColorForIndex(index, data.length)
					: hoveredIndex === index
						? color
							? adjustSaturation(color, 2.5)
							: DEFAULT_COLOR
						: MUTED_COLOR
			),
		[colors, hoveredIndex, data.length]
	);

	const chartData = useMemo(
		() => ({
			labels,
			datasets: [
				{
					data,
					backgroundColor,
					borderColor: "#181716",
					borderWidth: 3.5,
					borderRadius: 5,
				},
			],
		}),
		[labels, data, backgroundColor]
	);

	const options = useMemo(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			cutout: "50%",
			animations: {
				numbers: {
					duration: renderDuration,
				},
				colors: {
					type: "color" as const,
					properties: ["backgroundColor"],
					duration: () =>
						hasRenderedRef.current ? hoverDuration : renderDuration,
				},
			},
			onHover: (_event: ChartEvent, elements: ActiveElement[]) => {
				const index = elements[0]?.index ?? null;
				setLocalHoveredIndex(index);
				onHoveredIdChange?.(index === null ? null : ids[index]);
			},
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					enabled: false,
					external: (context: {
						chart: ChartJS;
						tooltip: TooltipModel<"doughnut">;
					}) => {
						const { chart, tooltip } = context;

						if (tooltip.opacity === 0) {
							setTooltipVisible(false);
							return;
						}

						const dataPoint = tooltip.dataPoints?.[0];
						const containerRect =
							containerRef.current?.getBoundingClientRect();
						if (!dataPoint || !containerRect) return;

						const canvasRect = chart.canvas.getBoundingClientRect();

						setTooltipData({
							label: String(dataPoint.label),
							value: dataPoint.formattedValue,
							color: (dataPoint.dataset.backgroundColor as string[])[
								dataPoint.dataIndex
							],
							x: canvasRect.left - containerRect.left + tooltip.caretX,
							y: canvasRect.top - containerRect.top + tooltip.caretY,
						});
						setTooltipVisible(true);
					},
				},
			},
		}),
		// tooltipData/tooltipVisible 刻意不放進依賴：它們只驅動疊加的 DOM tooltip，
		// 若讓 options reference 隨 hover 變動,會觸發 react-chartjs-2 的
		// update effect 與 external callback 互相觸發，造成無限迴圈。
		[ids, onHoveredIdChange, renderDuration, hoverDuration]
	);

	return (
		<div
			ref={containerRef}
			className="relative h-full w-full"
			onMouseLeave={() => {
				setLocalHoveredIndex(null);
				onHoveredIdChange?.(null);
				setTooltipVisible(false);
			}}
		>
			<Doughnut data={chartData} options={options} />

			{tooltipData && (
				<div
					className={cn(
						"pointer-events-none absolute z-50 rounded-lg bg-background/80 px-3 py-2 shadow-lg backdrop-blur-sm transition-[opacity,transform] ease-out",
						tooltipVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
					)}
					style={{
						left: tooltipData.x,
						top: tooltipData.y,
						transitionDuration: `${tooltipDuration}ms`,
						transform: "translate(-50%, calc(-100% - 10px))",
					}}
				>
					<div className="flex items-center gap-2">
						<span
							className="h-2.5 w-2.5 shrink-0 rounded-full"
							style={{ backgroundColor: tooltipData.color }}
						/>
						<span className="text-sm font-semibold text-secondary-foreground">
							{tooltipData.label}
						</span>
					</div>
					<div className="mt-0.5 text-right font-numeric text-base text-foreground">
						{tooltipData.value}
					</div>
				</div>
			)}
		</div>
	);
}
