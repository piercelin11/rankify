"use client";

import { RankingDraftData } from "@/types/data";
import React, {
	startTransition,
	useEffect,
	useOptimistic,
	useState,
} from "react";
import SorterResultListItem from "./ResultListItem";
import { Button } from "@/components/ui/button";
import submitRanking from "../actions/submitRanking";
import { notFound } from "next/navigation";
import deleteRankingDraft from "../../ranking/actions/deleteRankingDraft";
import { cn } from "@/lib/utils";
import saveDraftResult from "../../ranking/actions/saveDraftResult";
import { RankingResultData } from "./SortingStage";
import { setPercentage } from "@/features/sorter/slices/sorterSlice";
import { useAppDispatch } from "@/store/hooks";
import { useModal } from "@/lib/hooks/useModal";

type ResultStageProps = {
	draft: RankingDraftData;
};

export default function ResultStage({ draft }: ResultStageProps) {
	if (!draft.result) notFound();
	const result = draft.result! as RankingResultData[];
	const dispatch = useAppDispatch();

	const { showAlert, closeTop } = useModal();

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

	useEffect(() => {
		dispatch(setPercentage(100));
	}, [dispatch]);

	return (
		<div className="flex items-center justify-center py-20 2xl:py-32">
			<div className="flex-auto">
				<div className="sticky top-0 flex items-center justify-between bg-neutral-950 py-10">
					<h3>Your ranking result</h3>
					<div className="flex gap-5">
						<Button
							variant="default"
							onClick={() => {
								submitRanking(
									optimisticResult,
									draft.artistId,
									draft.id,
									"ARTIST"
								);
							}}
						>
							<p className="w-full">Submit</p>
						</Button>
						<Button
							variant="secondary"
							onClick={() =>
								showAlert({
									title: "Are You Sure?",
									description: "This action cannot be undone.",
									confirmText: "Delete Record",
									onConfirm: () =>
										deleteRankingDraft(
											result[0].artistId,
											`/artist/${result[0].artistId}/overview`
										),
									onCancel: () => closeTop(),
								})
							}
						>
							<p className="w-full">Delete</p>
						</Button>
					</div>
				</div>
				<div>
					{optimisticResult.map((data, index) => (
						<SorterResultListItem
							className={cn({
								"border-b-0 border-t border-primary-500":
									hoveredIndex === index && isAbove,
								"border-b border-t-0 border-primary-500":
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
		</div>
	);
}
