"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { GuestResultData } from "@/types/guest";
import { createCompletedSubmission } from "../actions/createCompletedSubmission";

type MigrationHandlerProps = {
	albumId: string;
	artistId: string;
};

export default function MigrationHandler({
	albumId,
	artistId,
}: MigrationHandlerProps) {
	const { toast } = useToast();
	const router = useRouter();
	const hasProcessedRef = useRef(false);

	useEffect(() => {
		const processMigration = async () => {
			// 防止重複執行
			if (hasProcessedRef.current) return;
			hasProcessedRef.current = true;

			const key = `rankify_guest_result_${albumId}`;
			const rawData = localStorage.getItem(key);

			if (!rawData) {
				// 無資料：導向首頁
				router.push('/');
				return;
			}

			try {
				const data = JSON.parse(rawData) as GuestResultData;

				// 檢查是否過期
				if (Date.now() > data.expiresAt) {
					localStorage.removeItem(key);
					// 資料過期：導向首頁
					router.push('/');
					return;
				}

				// 直接匯入 (不顯示確認 Modal)
				const result = await createCompletedSubmission({
					albumId,
					artistId,
					rankedList: data.resultState.rankedList,
					tracks: data.tracks,
				});

				if (result.success) {
					localStorage.removeItem(key);
					toast({
						title: "排名已保存!",
						description: "正在跳轉至歌手頁面...",
						variant: "default",
					});
					router.push(`/artist/${artistId}`);
				} else {
					toast({
						title: "保存失敗",
						description: "請重新整理頁面重試",
						variant: "destructive",
					});
					// 保留 LocalStorage (使用者可重試)
				}
			} catch (error) {
				console.error("Migration failed:", error);
				toast({
					title: "網路錯誤",
					description: "請重新整理頁面重試",
					variant: "destructive",
				});
				// 保留 LocalStorage 資料
			}
		};

		processMigration();
	}, [albumId, artistId, toast, router]);

	// 不需要渲染任何 UI (背景處理)
	return null;
}
