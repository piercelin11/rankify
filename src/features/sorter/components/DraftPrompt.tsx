"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import deleteSubmission from "../actions/deleteSubmission";
import { dateToDashFormat } from "@/lib/utils/date.utils";
import RankingStage from "./RankingStage";
import ResultStage from "./ResultStage";
import type { SorterStateType } from "@/lib/schemas/sorter";
import type { TrackData } from "@/types/data";
import { UserStorage } from "../storage/UserStorage";
import { useSorterContext } from "@/contexts/SorterContext";

type DraftPromptProps = {
	submissionId: string;
	draftState: SorterStateType;
	draftDate: Date;
	tracks: TrackData[];
	artistId: string;
	shouldSkipPrompt?: boolean;
};

export function DraftPrompt({
	submissionId,
	draftState,
	draftDate,
	tracks,
	artistId,
	shouldSkipPrompt = false,
}: DraftPromptProps) {
	const [choice, setChoice] = useState<"continue" | "restart" | null>(null);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const { setSaveStatus } = useSorterContext();

	// 建立 UserStorage 實例
	const storage = new UserStorage(submissionId, artistId, router, setSaveStatus);

	const handleRestart = () => {
		setChoice("restart");
		startTransition(async () => {
			await deleteSubmission({ submissionId });
			router.refresh();
		});
	};

	// 已完成 → 顯示結果
	if (draftState.finishFlag === 1) {
		return (
			<ResultStage
				draftState={draftState}
				tracks={tracks}
				storage={storage}
			/>
		);
	}

	// 使用者明確表達繼續意圖 (從首頁點擊 Continue) → 直接繼續,跳過確認 Modal
	if (shouldSkipPrompt) {
		return (
			<RankingStage
				initialState={draftState}
				tracks={tracks}
				storage={storage}
			/>
		);
	}

	// 使用者從未做過任何選擇 → 直接開始
	if (draftState.history.length === 0) {
		return (
			<RankingStage
				initialState={draftState}
				tracks={tracks}
				storage={storage}
			/>
		);
	}

	// 其他情況 → 顯示 modal 讓使用者選擇
	if (choice === null) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
				<div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
					<h2 className="text-xl font-semibold">Unfinished Draft Found</h2>
					<p className="text-muted-foreground">
						You have an incomplete draft from {dateToDashFormat(draftDate)}.
						Progress: {Math.round(draftState.percent)}%. Would you like to
						continue?
					</p>
					<div className="flex gap-3 justify-end">
						<Button
							variant="outline"
							onClick={handleRestart}
							disabled={isPending}
						>
							Start Over
						</Button>
						<Button
							onClick={() => setChoice("continue")}
							disabled={isPending}
						>
							Continue Draft
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (choice === "restart") {
		return (
			<div className="flex items-center justify-center py-20">
				<p className="text-muted-foreground">Deleting draft...</p>
			</div>
		);
	}

	return (
		<RankingStage
			initialState={draftState}
			tracks={tracks}
			storage={storage}
		/>
	);
}
