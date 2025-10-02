"use client";

import { useRouter } from "next/navigation";
import { useModal } from "@/contexts";
import { checkDraft } from "@/features/sorter/actions/checkDraft";
import deleteSubmission from "@/features/sorter/actions/deleteSubmission";
import { $Enums } from "@prisma/client";
import { useState, useCallback } from "react";
import { dateToDashFormat } from "@/lib/utils";
import {
	loadDraftFromLocalStorage,
	clearLocalDraft,
} from "@/features/sorter/utils/localDraft";

type UseRankingNavigationProps = {
	artistId: string;
	type?: $Enums.SubmissionType;
	albumId?: string;
};

export function useRankingNavigation({
	artistId,
	type = "ARTIST",
	albumId,
}: UseRankingNavigationProps) {
	const { showConfirm } = useModal();
	const router = useRouter();
	const [isNavigating, setIsNavigating] = useState(false);

	const navigateToRanking = useCallback(async () => {
		if (isNavigating) return;

		try {
			setIsNavigating(true);
			const targetUrl = `/sorter/artist/${artistId}`;
			const result = await checkDraft({ artistId, type, albumId });

			if (result.hasDraft) {
				// 檢查 localStorage 是否也有草稿
				const localDraft =
					result.userId && result.submissionId
						? loadDraftFromLocalStorage(result.userId, result.submissionId)
						: null;

				showConfirm({
					title: "Unfinished Draft Found",
					description: `You have an incomplete draft ${result.date && `from ${dateToDashFormat(result.date)}`}. Would you like to continue?`,
					confirmText: "Continue Draft",
					cancelText: "Start Over",
					variant: "default",
					onConfirm: () => {
						router.push(targetUrl);
					},
					onCancel: async () => {
						// 同時刪除 Server 和 Local Draft
						if (result.submissionId) {
							await deleteSubmission({ submissionId: result.submissionId });
						}
						if (localDraft && result.userId && result.submissionId) {
							clearLocalDraft(result.userId, result.submissionId);
						}
						router.push(targetUrl);
					},
				});
			} else {
				router.push(targetUrl);
			}
		} catch (error) {
			console.error("navigateToRanking error:", error);
			// 出錯時仍然導航，不要阻擋使用者
			router.push(`/sorter/artist/${artistId}`);
		} finally {
			setIsNavigating(false);
		}
	}, [artistId, type, albumId, showConfirm, router, isNavigating]);

	return { navigateToRanking, isNavigating };
}
