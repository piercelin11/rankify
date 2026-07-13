"use client";

import { useEffect, useRef, useState } from "react";
import { cn, toAcronym } from "@/lib/utils";
import Tooltip from "@/components/overlay/Tooltip";
import type { AlbumRankingItem } from "../types";
import { calculateBarDenominator } from "../utils/barScale";
import PercentChangeBadge from "./PercentChangeBadge";

type Props = {
	items: AlbumRankingItem[];
};

export default function AlbumScoreBarChart({ items }: Props) {
	const [mounted, setMounted] = useState(false);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [showPreviousId, setShowPreviousId] = useState<string | null>(null);

	useEffect(() => {
		const frame = requestAnimationFrame(() => setMounted(true));
		return () => cancelAnimationFrame(frame);
	}, []);

	if (items.length === 0) return null;

	const maxDenominator = calculateBarDenominator(items);

	function handleSelect(albumId: string) {
		setSelectedId((current) => (current === albumId ? null : albumId));
		setShowPreviousId(null);
	}

	function handleTogglePrevious(albumId: string) {
		setSelectedId(albumId);
		setShowPreviousId((current) => (current === albumId ? null : albumId));
	}

	function handleDeselect() {
		setSelectedId(null);
		setShowPreviousId(null);
	}

	return (
		<div className="flex h-[520px] flex-col">
			<div
				className="flex flex-1 items-end justify-between gap-4"
				onClick={handleDeselect}
			>
				{items.map((item) => (
					<AlbumScoreBar
						key={item.albumId}
						item={item}
						maxDenominator={maxDenominator}
						mounted={mounted}
						isSelected={selectedId === item.albumId}
						hasSelection={selectedId !== null}
						showPrevious={showPreviousId === item.albumId}
						onSelect={() => handleSelect(item.albumId)}
						onTogglePrevious={() => handleTogglePrevious(item.albumId)}
					/>
				))}
			</div>
		</div>
	);
}

type BarProps = {
	item: AlbumRankingItem;
	maxDenominator: number;
	mounted: boolean;
	isSelected: boolean;
	hasSelection: boolean;
	showPrevious: boolean;
	onSelect: () => void;
	onTogglePrevious: () => void;
};

function useAnimatedNumber(target: number, duration = 700) {
	const [value, setValue] = useState(target);
	const fromRef = useRef(target);

	useEffect(() => {
		const from = fromRef.current;
		if (from === target) return;

		const start = performance.now();
		let frame: number;

		function tick(now: number) {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			const current = Math.round(from + (target - from) * eased);
			setValue(current);
			fromRef.current = current;
			if (progress < 1) {
				frame = requestAnimationFrame(tick);
			}
		}

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [target, duration]);

	return value;
}

function AlbumScoreBar({
	item,
	maxDenominator,
	mounted,
	isSelected,
	hasSelection,
	showPrevious,
	onSelect,
	onTogglePrevious,
}: BarProps) {
	const isPositive = (item.percentChange ?? 0) >= 0;
	const peakPercent = Math.min((item.peak / maxDenominator) * 100, 100);
	const baseVar = isPositive ? "--primary" : "--destructive";
	const showBadge = !hasSelection || isSelected;

	const previousScore = item.percentChange
		? Math.round(item.score / (1 + item.percentChange))
		: item.score;
	const displayScore = showPrevious ? previousScore : item.score;

	const animatedScore = useAnimatedNumber(mounted ? displayScore : 0);
	const scorePercent = Math.min((animatedScore / maxDenominator) * 100, 100);

	const badgeLabel =
		item.percentChange == null
			? null
			: showPrevious
				? "prev score"
				: `${item.percentChange >= 0 ? "+" : ""}${(item.percentChange * 100).toFixed(0)}%`;

	const scoreGradient = `linear-gradient(to top, color-mix(in srgb, hsl(var(${baseVar})) 45%, white) 0%, hsl(var(${baseVar})) 20%)`;
	const glowShadow = isSelected
		? `0 0 24px 2px hsl(var(${baseVar}) / 0.55)`
		: "0 0 0 0 transparent";

	return (
		<div className="flex h-full flex-1 max-w-[250px] flex-col items-center gap-3">
			<div
				className="relative h-full w-full cursor-pointer"
				onClick={(e) => {
					e.stopPropagation();
					onSelect();
				}}
				role="button"
				tabIndex={0}
				aria-pressed={isSelected}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onSelect();
					}
				}}
			>
				<Tooltip content={isSelected ? <PeakTooltip peak={item.peak} /> : null}>
					<div
						className={cn(
							"absolute inset-x-0 bottom-0 w-full rounded-2xl transition-[height,opacity] duration-700 ease-out",
							isPositive ? "bg-primary/15" : "bg-destructive/15"
						)}
						style={{
							height: isSelected && mounted ? `${peakPercent}%` : "0%",
							opacity: isSelected ? 1 : 0,
						}}
					/>
				</Tooltip>

				<div
					className="absolute inset-x-0 bottom-0 w-full min-h-[4px] rounded-2xl"
					style={{ height: `${scorePercent}%` }}
				>
					<div
						className="absolute inset-0 rounded-2xl bg-[length:100%_300%] bg-bottom bg-no-repeat transition-[opacity,box-shadow] duration-700 ease-out"
						style={{
							backgroundImage: scoreGradient,
							boxShadow: glowShadow,
							opacity: hasSelection && !isSelected ? 0 : 1,
						}}
					/>
					<div
						className="absolute inset-0 rounded-2xl bg-muted transition-opacity duration-700 ease-out"
						style={{
							opacity: hasSelection && !isSelected ? 1 : 0,
						}}
					/>
					{showBadge && (
						<span className="absolute inset-x-0 top-2 text-center font-numeric text-base text-foreground">
							{animatedScore}
						</span>
					)}
				</div>
			</div>
			<div className="flex h-16 w-full flex-col items-center gap-1.5 text-center">
				<p className="line-clamp-2 text-sm font-semibold text-foreground">
					{toAcronym(item.name)}
				</p>
				{showBadge && (
					<PercentChangeBadge
						label={badgeLabel}
						onClick={onTogglePrevious}
						active={showPrevious}
						isPositive={isPositive}
					/>
				)}
			</div>
		</div>
	);
}

function PeakTooltip({ peak }: { peak: number }) {
	return (
		<div className="flex items-center gap-2">
			<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				Peak
			</span>
			<span className="font-numeric text-base text-foreground">{peak}</span>
		</div>
	);
}
