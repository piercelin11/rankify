"use client";

import { RankingDraftData } from "@/types/data";
import React, { startTransition, useOptimistic, useState } from "react";
import SorterResultListItem from "./SorterResultListItem";
import Button from "../ui/Button";
import submitRanking from "@/lib/action/user/submitRanking";
import { notFound } from "next/navigation";
import deleteRankingDraft from "@/lib/action/user/deleteRankingDraft";
import { cn } from "@/lib/cn";
import saveDraftResult from "@/lib/action/user/saveDraftResult";
import { RankingResultData } from "./SorterField";

type SorterResultProps = {
	draft: RankingDraftData;
};

export default function SorterResult({ draft }: SorterResultProps) {
	if (!draft.result) notFound();
	const result = draft.result;

	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [isAbove, setAbove] = useState<boolean | null>(null);
	const [optimisticResult, setOptimisticResult] = useOptimistic(
		result,
		(_, newResult: RankingResultData[]) => newResult
	);

	function onDragStart(index: number) {
		setDraggedIndex(index);
	}

	function onDragOver(e: React.DragEvent<HTMLDivElement>, index: number) {
		e.preventDefault();
		if (index === draggedIndex) return;

		setHoveredIndex(index);
		const hoverTarget = e.currentTarget;
		const hoverTargetRec = hoverTarget.getBoundingClientRect();
		const hoverTargetMiddleY = (hoverTargetRec.bottom + hoverTargetRec.top) / 2;
		const mouseY = e.clientY;
		setAbove(mouseY < hoverTargetMiddleY);
	}

	function onDragEnd() {
		if (draggedIndex === null || hoveredIndex === null) return;

		const previousRankings = [...result];
		const updatedRankings = [...result];
		const [draggedItem] = updatedRankings.splice(draggedIndex, 1);
		const insertIndex =
			hoveredIndex < draggedIndex
				? hoveredIndex + (isAbove ? 0 : 1)
				: hoveredIndex + (isAbove ? -1 : 0);

		updatedRankings.splice(insertIndex, 0, draggedItem);

		startTransition(async () => {
			setOptimisticResult(updatedRankings);
			try {
				await saveDraftResult(draft.artistId, updatedRankings);
			} catch (error) {
				console.error("Sometimg went wrong:", error);
				setOptimisticResult(previousRankings);
			}
		});
		setDraggedIndex(null);
		setHoveredIndex(null);
		setAbove(null);
	}

	return (
		<div>
			<div className="sticky top-0 flex items-center justify-between bg-zinc-950 py-10">
				<h3>Your ranking result</h3>
				<div className="flex gap-5">
					<Button
						variant="lime"
						onClick={() => {
							submitRanking(result, "ARTIST");
						}}
					>
						<p className="w-full">Submit</p>
					</Button>
					<Button
						variant="gray"
						onClick={() => {
							deleteRankingDraft(
								result[0].artistId,
								`/artist/${result[0].artistId}/overview`
							);
						}}
					>
						<p className="w-full">Cancel</p>
					</Button>
				</div>
			</div>
			<div>
				{optimisticResult.map((data, index) => (
					<SorterResultListItem
						className={cn({
							"border-b-0 border-t border-lime-500":
								hoveredIndex === index && isAbove,
							"border-b border-t-0 border-lime-500":
								hoveredIndex === index && !isAbove,
							"opacity-30": draggedIndex === index,
						})}
						onDragStart={() => onDragStart(index)}
						onDragOver={(e) => onDragOver(e, index)}
						onDragEnd={() => onDragEnd()}
						key={data.id}
						data={data}
						ranking={index + 1}
						draggable
					/>
				))}
			</div>
		</div>
	);
}
