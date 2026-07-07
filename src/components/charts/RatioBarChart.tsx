"use client";

import { useEffect, useState } from "react";
import { adjustColor } from "@/lib/utils/color.utils";

type BarItem = {
	id: string;
	value: number;
	color: string | null;
};

type Props = {
	items: BarItem[];
};

export default function RatioBarChart({ items }: Props) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const frame = requestAnimationFrame(() => setMounted(true));
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<div className="flex h-full items-end gap-2">
			{items.map((item) => (
				<div
					key={item.id}
					className="min-h-[4px] w-full flex-1 transition-[height] duration-700 ease-out"
					style={{
						height: mounted ? `${Math.max(item.value * 100, 2)}%` : "0%",
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
					/>
				</div>
			))}
		</div>
	);
}
