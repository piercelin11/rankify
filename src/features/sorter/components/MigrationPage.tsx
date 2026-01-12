"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCompletedSubmission } from "../actions/createCompletedSubmission";
import { getAllGuestResults } from "../utils/guestDataHelpers";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type MigrationResult = {
	albumId: string;
	albumName: string;
	status: "pending" | "success" | "failed";
	error?: string;
};

export default function MigrationPage() {
	const router = useRouter();
	const [results, setResults] = useState<MigrationResult[]>([]);
	const [isCompleted, setIsCompleted] = useState(false);
	const hasProcessedRef = useRef(false);

	useEffect(() => {
		if (hasProcessedRef.current) return;
		hasProcessedRef.current = true;

		const processMigration = async () => {
			const allGuestResults = getAllGuestResults();

			// 沒有資料 → 跳轉首頁
			if (allGuestResults.length === 0) {
				router.push("/");
				return;
			}

			// 初始化結果清單
			const initialResults: MigrationResult[] = allGuestResults.map(
				({ data }) => ({
					albumId: data.albumId,
					albumName: data.tracks[0]?.album?.name || data.albumId,
					status: "pending",
				})
			);
			setResults(initialResults);

			// 逐一匯入
			for (let i = 0; i < allGuestResults.length; i++) {
				const { key, data } = allGuestResults[i];

				try {
					const result = await createCompletedSubmission({
						albumId: data.albumId,
						artistId: data.artistId,
						rankedList: data.resultState.rankedList,
						tracks: data.tracks,
					});

					if (result.success) {
						// 成功 → 清除 LocalStorage
						localStorage.removeItem(key);
						setResults((prev) =>
							prev.map((item, idx) =>
								idx === i ? { ...item, status: "success" } : item
							)
						);
					} else {
						// 失敗 → 保留 LocalStorage,記錄錯誤
						setResults((prev) =>
							prev.map((item, idx) =>
								idx === i
									? { ...item, status: "failed", error: result.error }
									: item
							)
						);
					}
				} catch (error) {
					console.error("Migration failed for", key, error);
					setResults((prev) =>
						prev.map((item, idx) =>
							idx === i
								? {
										...item,
										status: "failed",
										error: "Network error, please retry",
								  }
								: item
						)
					);
				}
			}

			setIsCompleted(true);
		};

		processMigration();
	}, [router]);

	const successCount = results.filter((r) => r.status === "success").length;
	const failedCount = results.filter((r) => r.status === "failed").length;
	const totalCount = results.length;
	const progress = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

	// 載入中
	if (!isCompleted && totalCount > 0) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
				<h1 className="text-2xl font-bold">Importing Rankings...</h1>
				<Progress value={progress} className="w-full max-w-md" />
				<p className="text-muted-foreground">
					Imported {successCount}/{totalCount} albums
				</p>
			</div>
		);
	}

	// 完成
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
			<h1 className="text-2xl font-bold">
				{failedCount === 0 ? "Import Complete!" : "Partial Import Failure"}
			</h1>

			<div className="w-full max-w-2xl space-y-4">
				{/* 成功清單 */}
				{successCount > 0 && (
					<div>
						<h2 className="text-lg font-semibold text-green-600 mb-2">
							Successfully Imported ({successCount} albums)
						</h2>
						<ul className="space-y-2">
							{results
								.filter((r) => r.status === "success")
								.map((r) => (
									<li key={r.albumId} className="text-sm">
										✅ {r.albumName}
									</li>
								))}
						</ul>
					</div>
				)}

				{/* 失敗清單 */}
				{failedCount > 0 && (
					<div>
						<h2 className="text-lg font-semibold text-destructive mb-2">
							Failed to Import ({failedCount} albums)
						</h2>
						<ul className="space-y-2">
							{results
								.filter((r) => r.status === "failed")
								.map((r) => (
									<li key={r.albumId} className="text-sm">
										❌ {r.albumName} - {r.error || "Unknown error"}
									</li>
								))}
						</ul>
					</div>
				)}
			</div>

			{/* 操作按鈕 */}
			<div className="flex gap-4">
				{failedCount > 0 ? (
					<>
						<Button
							onClick={() => {
								hasProcessedRef.current = false;
								setResults([]);
								setIsCompleted(false);
							}}
						>
							Retry Failed Items
						</Button>
						<Button variant="outline" onClick={() => router.push("/")}>
							Skip and Go Home
						</Button>
					</>
				) : (
					<Button onClick={() => router.push("/")}>Go to Home</Button>
				)}
			</div>
		</div>
	);
}
