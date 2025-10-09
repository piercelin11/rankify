"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import deleteSubmission from "../actions/deleteSubmission";
import { dateToDashFormat } from "@/lib/utils/date.utils";
import RankingStage from "./RankingStage";
import type { SorterStateType } from "@/lib/schemas/sorter";
import type { TrackData } from "@/types/data";

type DraftPromptProps = {
	submissionId: string;
	draftState: SorterStateType;
	draftDate: Date;
	tracks: TrackData[];
	userId: string;
};

export function DraftPrompt({
	submissionId,
	draftState,
	draftDate,
	tracks,
	userId,
}: DraftPromptProps) {
	const [choice, setChoice] = useState<"continue" | "restart" | null>(null);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const handleRestart = () => {
		setChoice("restart");
		startTransition(async () => {
			await deleteSubmission({ submissionId });
			router.refresh(); // 觸發 RSC refresh，會被 transition 追蹤
		});
	};

	// 使用者尚未選擇 → 顯示 Modal
	if (choice === null) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
				<div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
					<h2 className="text-xl font-semibold">Unfinished Draft Found</h2>
					<p className="text-muted-foreground">
						You have an incomplete draft from {dateToDashFormat(draftDate)}.
						Would you like to continue?
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

	// 使用者選擇重新開始 → 顯示刪除中畫面
	if (choice === "restart") {
		return (
			<div className="flex items-center justify-center py-20">
				<p className="text-muted-foreground">正在刪除草稿...</p>
			</div>
		);
	}

	// 使用者選擇繼續 → 顯示 RankingStage
	return (
		<RankingStage
			initialState={draftState}
			tracks={tracks}
			submissionId={submissionId}
			userId={userId}
		/>
	);
}
