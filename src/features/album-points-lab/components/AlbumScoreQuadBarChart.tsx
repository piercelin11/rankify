"use client";

import { useEffect, useState } from "react";
import { cn, toAcronym } from "@/lib/utils";
import { DEFAULT_COLOR, MUTED_COLOR } from "@/constants";

const UNWEIGHTED_COLOR = MUTED_COLOR;
const ONE_DIRECTIONAL_COLOR = "#264756"; // --chart-3
const TRIMMED_COLOR = "#e1c340"; // --chart-4

type BarGroup = {
	id: string;
	label: string;
	color: string | null;
	weighted: number;
	unweighted: number;
	oneDirectional: number;
	trimmed: number;
};

type Series = "weighted" | "unweighted" | "oneDirectional" | "trimmed";

const SERIES_CONFIG: Record<
	Series,
	{ label: string; color: string; textClassName: string }
> = {
	weighted: {
		label: "Weighted",
		color: DEFAULT_COLOR,
		textClassName: "text-primary",
	},
	unweighted: {
		label: "Unweighted",
		color: UNWEIGHTED_COLOR,
		textClassName: "text-muted-foreground",
	},
	oneDirectional: {
		label: "One-directional",
		color: ONE_DIRECTIONAL_COLOR,
		textClassName: "text-foreground",
	},
	trimmed: {
		label: "Trimmed",
		color: TRIMMED_COLOR,
		textClassName: "text-foreground",
	},
};

const ALL_SERIES: Series[] = [
	"weighted",
	"unweighted",
	"oneDirectional",
	"trimmed",
];

type Props = {
	items: BarGroup[];
};

export default function AlbumScoreQuadBarChart({ items }: Props) {
	const [mounted, setMounted] = useState(false);
	const [hiddenSeries, setHiddenSeries] = useState<Set<Series>>(new Set());

	useEffect(() => {
		const frame = requestAnimationFrame(() => setMounted(true));
		return () => cancelAnimationFrame(frame);
	}, []);

	const visibleSeries = ALL_SERIES.filter((s) => !hiddenSeries.has(s));

	const maxValue = Math.max(
		...items.flatMap((item) => visibleSeries.map((s) => item[s])),
		1
	);

	function toggleSeries(series: Series) {
		setHiddenSeries((prev) => {
			const next = new Set(prev);
			if (next.has(series)) {
				next.delete(series);
			} else {
				next.add(series);
			}
			return next;
		});
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex flex-1 items-end gap-4">
				{items.map((item) => (
					<div key={item.id} className="flex h-full flex-1 items-end gap-1">
						{visibleSeries.map((series) => {
							const value = item[series];
							const ratio = value / maxValue;
							const config = SERIES_CONFIG[series];
							return (
								<div
									key={series}
									className="relative flex h-full flex-1 items-end"
								>
									<div
										className="relative min-h-[4px] w-full rounded-2xl transition-[height] duration-700 ease-out"
										style={{
											height: mounted
												? `${Math.max(ratio * 100, 2)}%`
												: "0%",
										}}
									>
										<div
											className={cn(
												"absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold",
												config.textClassName
											)}
										>
											{value}
										</div>
										<div
											className="h-full w-full rounded-2xl"
											style={{ background: config.color }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				))}
			</div>

			<div className="mt-2 flex gap-4">
				{items.map((item) => (
					<div
						key={item.id}
						className="w-full flex-1 truncate px-1 text-center text-xs text-muted-foreground"
					>
						{toAcronym(item.label)}
					</div>
				))}
			</div>

			<div className="mt-3 flex flex-wrap items-center justify-center gap-6 text-xs">
				{ALL_SERIES.map((series) => {
					const config = SERIES_CONFIG[series];
					const isVisible = !hiddenSeries.has(series);
					return (
						<button
							key={series}
							type="button"
							onClick={() => toggleSeries(series)}
							className={cn(
								"flex items-center gap-1.5 transition-opacity",
								!isVisible ? "opacity-40" : "opacity-100"
							)}
						>
							<span
								className="h-2.5 w-2.5 rounded-full"
								style={{ background: config.color }}
							/>
							<span
								className={
									isVisible ? "text-foreground" : "text-muted-foreground"
								}
							>
								{config.label}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
