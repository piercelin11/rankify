"use client";

import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

type AnimatedProgressProps = {
	value: number;
	label: string;
	duration?: number;
};

export function AnimatedProgress({
	value,
	label,
	duration = 1500
}: AnimatedProgressProps) {
	const [currentValue, setCurrentValue] = useState(0);

	useEffect(() => {
		const startTime = Date.now();
		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			const easedProgress = 1 - Math.pow(1 - progress, 3);
			setCurrentValue(Math.round(value * easedProgress));

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		};

		// 延遲開始，讓頁面載入完成
		const timer = setTimeout(() => {
			requestAnimationFrame(animate);
		}, 200);

		return () => clearTimeout(timer);
	}, [value, duration]);

	return (
		<div className="space-y-2">
			<div className="flex justify-between text-sm">
				<span className="text-neutral-500">{label}</span>
				<span className="font-semibold">{currentValue}%</span>
			</div>
			<Progress className="h-1.5" value={currentValue} />
		</div>
	);
}