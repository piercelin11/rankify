"use client";

import { useEffect, useState } from "react";
import RankingStage from "./RankingStage";
import ResultStage from "./ResultStage";
import { SorterStateType } from "@/types/schemas/sorter";
import { TrackData } from "@/types/data";
import { loadDraftFromLocalStorage, cleanupExpiredDrafts } from "../utils/localDraft";

interface SorterWithConflictResolverProps {
	serverDraft: {
		state: SorterStateType;
		updatedAt: string;
	};
	tracks: TrackData[];
	submissionId: string;
	userId: string;
	status: "IN_PROGRESS" | "DRAFT";
}

export default function SorterWithConflictResolver({
	serverDraft,
	tracks,
	submissionId,
	userId,
	status,
}: SorterWithConflictResolverProps) {
	const [resolvedState, setResolvedState] = useState<SorterStateType | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		// 清理過期的本地草稿
		cleanupExpiredDrafts();

		// 檢查本地草稿
		const localDraft = loadDraftFromLocalStorage(userId, submissionId);

		if (localDraft) {
			const serverTimestamp = new Date(serverDraft.updatedAt);
			const localTimestamp = new Date(localDraft.savedAt);

			if (localTimestamp >= serverTimestamp) {
				// 本地版本較新或相同，使用本地版本
				setResolvedState(localDraft.state);
			} else {
				// 伺服器版本較新，使用伺服器版本
				setResolvedState(serverDraft.state);
			}
		} else {
			// 只有伺服器版本
			setResolvedState(serverDraft.state);
		}

		setIsInitialized(true);
	}, [serverDraft, submissionId, userId]);

	if (!isInitialized) {
		return <div className="flex items-center justify-center py-20">Loading...</div>;
	}

	// 根據狀態顯示對應的介面
	if (resolvedState) {
		if (status === "IN_PROGRESS") {
			return (
				<RankingStage
					initialState={resolvedState}
					tracks={tracks}
					submissionId={submissionId}
					userId={userId}
				/>
			);
		}

		if (status === "DRAFT") {
			return (
				<ResultStage
					draftState={resolvedState}
					tracks={tracks}
					userId={userId}
					submissionId={submissionId}
				/>
			);
		}
	}

	return <div>Error: No state available</div>;
}