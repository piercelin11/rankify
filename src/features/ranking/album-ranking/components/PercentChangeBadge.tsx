import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SCRAMBLE_CHARS = "!@#%&*0123456789";

function useScrambleText(target: string, duration = 700) {
	const [display, setDisplay] = useState(target);
	const [isAnimating, setIsAnimating] = useState(false);
	const displayRef = useRef(target);

	useEffect(() => {
		if (displayRef.current === target) return;

		const from = displayRef.current;
		const start = performance.now();
		let frame: number;
		setIsAnimating(true);

		function tick(now: number) {
			const progress = Math.min((now - start) / duration, 1);
			const currentLength = Math.round(
				from.length + (target.length - from.length) * progress
			);
			const settledCount = Math.floor(
				progress * Math.min(currentLength, target.length)
			);
			const next = Array.from({ length: currentLength }, (_, i) => {
				if (i < settledCount) return target[i] ?? "";
				return SCRAMBLE_CHARS[
					Math.floor(Math.random() * SCRAMBLE_CHARS.length)
				];
			}).join("");
			displayRef.current = next;
			setDisplay(next);

			if (progress < 1) {
				frame = requestAnimationFrame(tick);
			} else {
				displayRef.current = target;
				setDisplay(target);
				setIsAnimating(false);
			}
		}

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [target, duration]);

	return { display, isAnimating };
}

type Props = {
	label: string | null;
	onClick?: () => void;
	active?: boolean;
	isPositive: boolean;
};

export default function PercentChangeBadge({
	label,
	onClick,
	active,
	isPositive,
}: Props) {
	const { display, isAnimating } = useScrambleText(label ?? "");

	if (label === null) return null;

	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation();
				onClick?.();
			}}
			disabled={isAnimating}
			className={cn(
				"rounded-full px-3.5 py-1 text-sm font-medium transition-colors duration-700",
				active
					? "bg-secondary text-secondary-foreground"
					: isPositive
						? "bg-primary/15 text-primary"
						: "bg-destructive/15 text-destructive",
				isAnimating && "cursor-not-allowed"
			)}
		>
			{display}
		</button>
	);
}
