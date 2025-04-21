"use client";

import { RankingDraftData } from "@/types/data";
import React, {
	startTransition,
	useEffect,
	useOptimistic,
	useState,
} from "react";
import SorterResultListItem from "./ResultListItem";
import Button from "@/components/buttons/Button";
import submitRanking from "../actions/submitRanking";
import { notFound } from "next/navigation";
import deleteRankingDraft from "../actions/deleteRankingDraft";
import { cn } from "@/lib/cn";
import saveDraftResult from "../actions/saveDraftResult";
import { RankingResultData } from "./SortingStage";
import { CurrentStage } from "./SorterPage";
import ComfirmationModal from "@/components/modals/ComfirmationModal";
import { setPercentage } from "@/features/sorter/slices/sorterSlice";
import { useAppDispatch } from "@/store/hooks";

type ResultStageProps = {
	draft: RankingDraftData;
	setCurrentStage: React.Dispatch<React.SetStateAction<CurrentStage | null>>;
};

export default function ResultStage({ draft }: ResultStageProps) {
	if (!draft.result) notFound();
	const result = draft.result;
	const dispatch = useAppDispatch();

	const [isCancelOpen, setCancelOpen] = useState(false);

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
	}, []);

	return (
		<div className="flex items-center justify-center py-20 2xl:py-32">
			<div className="flex-auto">
				<div className="sticky top-0 flex items-center justify-between bg-zinc-950 py-10">
					<h3>Your ranking result</h3>
					<div className="flex gap-5">
						<Button
							variant="primary"
							onClick={() => {
								submitRanking(result, "ARTIST");
							}}
						>
							<p className="w-full">Submit</p>
						</Button>
						<Button variant="secondary" onClick={() => setCancelOpen(true)}>
							<p className="w-full">Delete</p>
						</Button>
						<ComfirmationModal
							onConfirm={() => {
								deleteRankingDraft(
									result[0].artistId,
									`/artist/${result[0].artistId}/overview`
								);
							}}
							onCancel={() => setCancelOpen(false)}
							isOpen={isCancelOpen}
							setOpen={setCancelOpen}
							cancelLabel="Cancel"
							comfirmLabel="Delete Record"
							description="You will delete your sorting record."
							warning="Are you sure you want to delete it?"
						/>
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
		</div>
	);
}
