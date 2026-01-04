"use client";

import { useState, useEffect } from "react";
import { GuestResultData } from "@/types/guest";
import ResultStage from "./ResultStage";
import RankingStage from "./RankingStage";
import { SorterStateType } from "@/lib/schemas/sorter";
import { TrackData } from "@/types/data";
import { GuestStorage } from "../storage/GuestStorage";
import { useModal } from "@/contexts";

type GuestSorterEntryProps = {
	albumId: string;
	artistId: string;
	tracks: TrackData[];
	initialState: SorterStateType;
};

/**
 * Guest 模式的進入點
 *
 * 職責:
 * 1. 從 LocalStorage 讀取 Guest 的排序結果
 * 2. 檢查過期時間 (24 小時)
 * 3. 條件渲染: ResultStage (已完成) 或 RankingStage (未完成)
 */
export default function GuestSorterEntry({
	albumId,
	artistId,
	tracks,
	initialState,
}: GuestSorterEntryProps) {
	const [guestData, setGuestData] = useState<GuestResultData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { showAuthGuard } = useModal();

	// 建立 GuestStorage 實例
	const storage = new GuestStorage(albumId, artistId, showAuthGuard);

	useEffect(() => {
		const key = `rankify_guest_result_${albumId}`;
		const rawData = localStorage.getItem(key);

		if (rawData) {
			try {
				const data = JSON.parse(rawData) as GuestResultData;

				// 檢查是否過期 (24 小時)
				if (Date.now() > data.expiresAt) {
					localStorage.removeItem(key);
				} else {
					setGuestData(data);
				}
			} catch (error) {
				console.error("Failed to parse guest data:", error);
				localStorage.removeItem(key);
			}
		}

		setIsLoading(false);
	}, [albumId]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p>載入中...</p>
			</div>
		);
	}

	// Guest 已完成排名 → 顯示結果頁
	if (guestData && guestData.resultState.completedAt) {
		return (
			<ResultStage
				tracks={tracks}
				storage={storage}
				initialRankedList={guestData.resultState.rankedList}
			/>
		);
	}

	// Guest 尚未完成 → 顯示排序器
	return (
		<RankingStage
			tracks={tracks}
			storage={storage}
			initialState={initialState}
		/>
	);
}
