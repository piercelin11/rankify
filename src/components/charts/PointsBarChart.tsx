"use client";

import { useEffect, useState } from "react";
import { adjustColor } from "@/lib/utils/color.utils";
import { toAcronym } from "@/lib/utils";

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

	useEffect(() => {
		const frame = requestAnimationFrame(() => setMounted(true));
		return () => cancelAnimationFrame(frame);
	}, []);

	const maxValue = Math.max(...items.map((item) => item.value), 1);

	return (
		<div className="flex h-full flex-col">
			<div className="flex flex-1 items-end gap-2">
				{items.map((item) => {
					const ratio = item.value / maxValue;
					return (
						<div
							key={item.id}
							className="min-h-[4px] w-full flex-1 transition-[height] duration-700 ease-out"
							style={{
								height: mounted ? `${Math.max(ratio * 100, 2)}%` : "0%",
							}}
						>
							<div
								className="h-full w-full rounded-md transition-colors hover:[background-color:var(--hover-color)]"
								style={
									{
										backgroundColor: adjustColor(item.color, 0.5, 2.5),
										"--hover-color": adjustColor(item.color, 0.55, 2.8),
									} as React.CSSProperties
								}
								title={`${item.label}: ${item.value}`}
							/>
						</div>
					);
				})}
			</div>

			<div className="mt-2 flex gap-2">
				{items.map((item) => (
					<div
						key={item.id}
						className="w-full flex-1 truncate text-center text-xs text-muted-foreground"
					>
						{toAcronym(item.label)}
					</div>
				))}
			</div>
		</div>
	);
}
