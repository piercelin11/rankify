"use client"

import { ensureBrightness } from "@/lib/utils/adjustColor";
import React, { useEffect, useState } from "react";

type TimesInTopPercentBarProps = {
    threshold: number;
    count: number;
    trackLoggedCount: number;
    color?: string | null;
}

export default function TimesInTopPercentBar({threshold, count, trackLoggedCount, color}: TimesInTopPercentBarProps) {
	const [animatedWidth, setAnimatedWidth] = useState("0%");

    useEffect(() => {
        const widthPercentage = `${(count / trackLoggedCount) * 100}%`;
        const timeout = setTimeout(() => {
            setAnimatedWidth(widthPercentage);
        }, 100);

        return () => clearTimeout(timeout);
    }, [count, trackLoggedCount]);

	return (
		<div className="space-y-2">
			<div className="flex justify-between">
				<p className="text-zinc-300 font-numeric">Occurrences in Top {threshold}%</p>
				<p>{count}</p>
			</div>

			<div className="relative h-2 w-full rounded-full bg-zinc-750">
				<div
					className="h-full rounded-full transition-all duration-1000 ease-in-out"
					style={{
						width: animatedWidth,
                        backgroundColor: color ? ensureBrightness(color) : "#fef27a",
					}}
				></div>
			</div>
		</div>
	);
}
